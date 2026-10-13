import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Build tooling only. The runtime/compiler pair comes from the same exact package.
const require = createRequire(import.meta.url);
const { Compiler } = require('inkjs/full') as typeof import('inkjs/full');
export const fixtureSource = 'narrative/fixtures/technical_fixture.ink';
export const fixtureOutput = 'generated/narrative/technical_fixture.json';

export function compileFixture() {
  const story = new Compiler(readFileSync(fixtureSource, 'utf8')).Compile();
  mkdirSync('generated/narrative', { recursive: true });
  const json = story.ToJson();
  if (typeof json !== 'string')
    throw new Error('Ink compiler did not produce JSON');
  writeFileSync(fixtureOutput, json);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  compileFixture();
  console.log(`Compiled technical fixture only: ${fixtureOutput}`);
}
