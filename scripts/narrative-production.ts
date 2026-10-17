import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { readApprovedDemoContent } from './demo-content.ts';
import references from '../narrative/production/references.json' with { type: 'json' };
import { createDemoDomainStore } from '../src/state/demoDomainStore.ts';
import { createDemoEventRegistry } from '../src/narrative/demoEvents.ts';
import { NarrativeController } from '../src/narrative/NarrativeController.ts';
import { createNarrativeQueryPort } from '../src/narrative/NarrativeQueryPort.ts';

const require = createRequire(import.meta.url);
const { Compiler, CompilerOptions } =
  require('inkjs/full') as typeof import('inkjs/full');
export const demoOutput = 'generated/narrative/demo.json';

export function compileDemo() {
  const main = resolve('narrative/main.ink');
  const compiler = new Compiler(
    readFileSync(main, 'utf8'),
    new CompilerOptions(main, [], false, null, {
      ResolveInkFilename: (file, source) =>
        resolve(dirname(source ?? main), file),
      LoadInkFileContents: (file) => readFileSync(file, 'utf8'),
    }),
  );
  const story = compiler.Compile();
  if (compiler.errors.length || compiler.warnings.length)
    throw new Error([...compiler.errors, ...compiler.warnings].join('\n'));
  mkdirSync('generated/narrative', { recursive: true });
  const json = story.ToJson();
  if (typeof json !== 'string')
    throw new Error('Production compiler did not return JSON');
  writeFileSync(demoOutput, json);
}

export function validateDemo() {
  const approved = readApprovedDemoContent();
  const ids = new Set<string>();
  for (const file of [
    'prologue.ink',
    'days/day01.ink',
    'days/day02.ink',
    'days/day03.ink',
  ]) {
    for (const row of readFileSync(`narrative/${file}`, 'utf8').split(
      /\r?\n/,
    )) {
      const match = /# line:(demo\.[A-Za-z0-9.-]+)/.exec(row);
      if (!match) continue;
      const id = match[1];
      if (ids.has(id)) throw new Error(`Duplicate production Line ID: ${id}`);
      ids.add(id);
      const source = approved.get(id.slice(5));
      if (!source || !row.includes(source.text))
        throw new Error(`Unapproved/changed text: ${id}`);
    }
  }
  if (ids.size !== Object.keys(references.lines).length)
    throw new Error('Production reference mismatch');
  // Deterministic complete runs cover both callback states, every branch and rejoin.
  const visited = new Set<string>();
  for (let route = 0; route < 64; route++) {
    const store = createDemoDomainStore();
    const controller = new NarrativeController(
      readFileSync(demoOutput, 'utf8'),
      references,
      createDemoEventRegistry(),
      createNarrativeQueryPort(store),
      {
        dispatch() {
          throw new Error('Unexpected demo one-shot event');
        },
      },
      store,
      { scope: 'emergency-demo-day1-day3' },
    );
    controller.start();
    let step = 0;
    let choice = 0;
    while (controller.getSnapshot().phase !== 'ended') {
      if (++step > 400)
        throw new Error('Production traversal did not terminate');
      const view = controller.getSnapshot();
      if (view.phase === 'error')
        throw new Error(view.error ?? 'Production error');
      if (view.phase === 'line' && view.line) {
        visited.add(view.line.id);
        const expected = approved.get(view.line.id.slice(5));
        if (expected?.text !== view.line.text)
          throw new Error(`Runtime text differs: ${view.line.id}`);
        const labels: Record<string, string> = {
          none: '',
          girl: 'เด็กหญิง',
          boy: 'เด็กชาย',
          awning_boy: 'เด็กชายที่ชายคา',
          manao: 'มะนาว',
          som: 'ส้ม',
          nut: 'นัท',
          kan: 'กันต์',
        };
        const expectedLabel =
          expected.speaker.includes('UI') || expected.speaker === 'ผู้บรรยาย'
            ? ''
            : expected.speaker;
        if (labels[view.presentation.speaker] !== expectedLabel)
          throw new Error(`Unapproved speaker label: ${view.line.id}`);
        controller.continue(view);
      } else if (view.phase === 'choice') {
        const index =
          view.choices.length === 1 ? 0 : (route >> (choice++ % 6)) & 1;
        for (const item of view.choices) {
          if (approved.get(item.id.slice(5))?.text !== item.text)
            throw new Error('Unapproved choice text');
          visited.add(item.id);
        }
        controller.choose(view, index);
      } else throw new Error(`Unexpected production phase: ${view.phase}`);
    }
    controller.dispose();
  }
  for (const id of Object.keys(references.lines))
    if (!visited.has(id))
      throw new Error(`Unvisited production line/choice: ${id}`);
  return { linesAndChoices: visited.size, runs: 64 };
}
