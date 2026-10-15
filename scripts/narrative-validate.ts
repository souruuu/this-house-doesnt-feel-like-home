import { readFileSync, readdirSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Story } from 'inkjs';
import { fixtureOutput, fixtureSource } from './narrative-compile.ts';

interface FixtureReferences {
  scope: string;
  scenes: Record<string, string>;
  speakers: string[];
  expressions: Record<string, string>;
  positions: string[];
  events: string[];
  assets: string[];
}

export function assertAssetPath(path: string) {
  if (
    !/^[a-zA-Z0-9_./-]+$/.test(path) ||
    path.startsWith('/') ||
    path.split('/').some((part) => !part || part === '..' || part === '.')
  ) {
    throw new Error(`Unsafe asset path: ${path}`);
  }
  let parent = 'public';
  for (const part of path.split('/')) {
    if (!readdirSync(parent).includes(part))
      throw new Error(`Missing/case-mismatched asset: ${path}`);
    parent += `/${part}`;
  }
  if (!statSync(parent).isFile())
    throw new Error(`Asset is not a file: ${path}`);
}

export function validateTags(
  tags: string[],
  text: string,
  references: FixtureReferences,
) {
  const values = new Map<string, string>();
  for (const tag of tags) {
    const match =
      /^(line|speaker|expression|position|event):([A-Za-z0-9_.-]+)$/.exec(
        tag.trim(),
      );
    if (!match) throw new Error(`Unknown/invalid tag: ${tag}`);
    const [, key, value] = match;
    if (values.has(key)) throw new Error(`Duplicate tag: ${key}`);
    values.set(key, value);
    if (key === 'speaker' && !references.speakers.includes(value))
      throw new Error(`Unknown speaker: ${value}`);
    if (key === 'event' && !references.events.includes(value))
      throw new Error(`Unknown event: ${value}`);
    if (key === 'position' && !references.positions.includes(value))
      throw new Error(`Unknown position: ${value}`);
    if (key === 'expression' && !Object.hasOwn(references.expressions, value))
      throw new Error(`Unknown expression: ${value}`);
  }
  if (text.trim() && !values.has('line'))
    throw new Error('Readable output requires a stable Line ID');
  return values.get('line');
}

export function validateFixture() {
  const references = JSON.parse(
    readFileSync('narrative/fixtures/references.json', 'utf8'),
  ) as FixtureReferences;
  if (references.scope !== 'technical-fixture-only')
    throw new Error('Fixture must not be release content');
  const source = readFileSync(fixtureSource, 'utf8');
  for (const knot of Object.values(references.scenes)) {
    if (!source.includes(`=== ${knot} ===`))
      throw new Error(`Missing fixture scene knot: ${knot}`);
  }
  const manifest = JSON.parse(
    readFileSync('src/assets/manifest.json', 'utf8'),
  ) as Record<string, { path: string; status: string }>;
  for (const id of references.assets) {
    if (!Object.hasOwn(manifest, id)) throw new Error(`Unknown asset: ${id}`);
  }
  for (const asset of Object.values(manifest)) {
    if (asset.status !== 'placeholder')
      throw new Error('M0 accepts technical placeholders only');
    assertAssetPath(asset.path);
  }
  const story = new Story(readFileSync(fixtureOutput, 'utf8'));
  const lines = new Set<string>();
  while (story.canContinue) {
    const text = story.Continue() ?? '';
    const line = validateTags(story.currentTags ?? [], text, references);
    if (line) {
      if (lines.has(line)) throw new Error(`Duplicate Line ID: ${line}`);
      lines.add(line);
    }
  }
  if (story.currentChoices.length)
    throw new Error('M0 linear probe must not introduce narrative engine work');
  if (!lines.size) throw new Error('Empty compiler probe');
  return lines.size;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(
    `Validated ${validateFixture()} technical lines and fixture references; release story not present.`,
  );
}
