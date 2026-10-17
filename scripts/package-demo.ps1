param([string]$OutputDirectory = 'C:\Users\USER\AppData\Local\Temp\this-house-emergency-demo-20261017')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$distPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../dist'))
if (-not (Test-Path -LiteralPath (Join-Path $distPath 'index.html'))) { throw 'Run npm run build first' }
$files = [System.Collections.Generic.Dictionary[string,string]]::new([System.StringComparer]::Ordinal)
function Assert-PortablePath([string]$Path) {
  if ($Path.Contains('\') -or $Path -match '(^/|:|(^|/)\.\.?(/|$)|//)' -or [System.IO.Path]::IsPathRooted($Path)) {
    throw "Non-portable ZIP path: $Path"
  }
}
foreach ($file in Get-ChildItem -LiteralPath $distPath -Recurse -File) {
  $relative = $file.FullName.Substring($distPath.Length + 1).Replace('\', '/')
  Assert-PortablePath $relative
  if ($relative -notmatch '\.(html|js|css|png|svg)$' -or $relative -match '(^|/)(node_modules|generated|sources|tests|\.git)/') {
    throw "Unexpected production file: $relative"
  }
  if ($file.Extension -match '^\.(html|js|css|svg)$') {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match 'ghp_[A-Za-z0-9]{30}|github_pat_[A-Za-z0-9_]{30}|AKIA[A-Z0-9]{16}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|sourceMappingURL|fixture_start_001|fixture\.domain\.branch_a|fixture\.branch_committed|technical_fixture|class InkParser') {
      throw "Production content audit failed: $relative"
    }
  }
  $files.Add($relative, $file.FullName)
}
# Check HTML asset URLs with ordinal casing rather than Windows filesystem lookup.
$html = [System.IO.File]::ReadAllText((Join-Path $distPath 'index.html'))
foreach ($match in [regex]::Matches($html, '(?:src|href)=["'']([^"'']+)["'']')) {
  $assetPath = $match.Groups[1].Value -replace '^\./', ''
  Assert-PortablePath $assetPath
  if (-not $files.ContainsKey($assetPath)) { throw "Missing or case-mismatched HTML asset URL: $assetPath" }
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$zipPath = Join-Path ([System.IO.Path]::GetFullPath($OutputDirectory)) ('this-house-day1-day3-demo-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.zip')
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($name in $files.Keys) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $files[$name], $name, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose() }
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  if (-not $archive.GetEntry('index.html')) { throw 'ZIP requires root index.html' }
  if ($archive.Entries.Count -ne $files.Count) { throw 'ZIP file count differs from dist' }
  $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
  foreach ($entry in $archive.Entries) {
    Assert-PortablePath $entry.FullName
    if (-not $seen.Add($entry.FullName) -or -not $files.ContainsKey($entry.FullName)) { throw 'Unexpected, duplicate or case-mismatched ZIP entry' }
    $file = $files[$entry.FullName]
    $stream = $entry.Open()
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { $entryHash = [System.BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '') }
    finally { $stream.Dispose(); $sha.Dispose() }
    if ($entryHash -ne (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash) { throw 'ZIP bytes differ from dist' }
  }
  "Verified portable ZIP entries: $($archive.Entries.Count); production content audit passed"
} finally { $archive.Dispose() }
[pscustomobject]@{
  FullName = $zipPath
  Bytes = (Get-Item -LiteralPath $zipPath).Length
  SHA256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
} | ConvertTo-Json
