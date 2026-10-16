import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const handoffDirectory = 'sources/emergency-demo-2026-10-17';

export function readApprovedDemoContent() {
  const sums = readFileSync(`${handoffDirectory}/SHA256SUMS.txt`, 'utf8');
  const rows = new Map<
    string,
    { text: string; speaker: string; source: string }
  >();
  for (const line of sums.trim().split(/\r?\n/)) {
    const [expected, file] = line.split(/\s+/, 2);
    const bytes = readFileSync(`${handoffDirectory}/${file}`);
    if (createHash('sha256').update(bytes).digest('hex') !== expected)
      throw new Error(`Handoff checksum mismatch: ${file}`);
    if (!file.startsWith('Narrative_Package')) continue;
    let inContent = false;
    for (const sourceLine of bytes.toString('utf8').split(/\r?\n/)) {
      if (sourceLine.startsWith('## '))
        inContent = /^## B(?:\.|0\.)/.test(sourceLine);
      if (!inContent) continue;
      if (!sourceLine.startsWith('|')) continue;
      const cells = sourceLine
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      const id =
        /`(D(?:[123]\d\d|1N|1P|3E)-(?:L\d{3}[A-Z]?|C\d{2}-[AB]))`/.exec(
          cells[0],
        )?.[1];
      if (id && !rows.has(id))
        rows.set(id, { text: cells[2], speaker: cells[1], source: file });
    }
  }
  return rows;
}
