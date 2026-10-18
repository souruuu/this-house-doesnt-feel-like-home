import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, relative } from 'node:path';
import {
  readApprovedDemoContent,
  readEditorialRows,
  demoSpeakerLabels,
  type EditorialRow,
} from './demo-content.ts';
import references from '../narrative/production/references.json' with { type: 'json' };
import { createDemoDomainStore } from '../src/state/demoDomainStore.ts';
import {
  createDemoEventRegistry,
  demoFactDefinitions,
} from '../src/narrative/demoEvents.ts';
import { NarrativeController } from '../src/narrative/NarrativeController.ts';
import { createNarrativeQueryPort } from '../src/narrative/NarrativeQueryPort.ts';
import type { FixtureReferences } from '../src/narrative/types.ts';

const require = createRequire(import.meta.url);
const { Compiler, CompilerOptions } =
  require('inkjs/full') as typeof import('inkjs/full');
export const demoOutput = 'generated/narrative/demo.json';

export function compileDemoText(
  overrides: Readonly<Record<string, string>> = {},
) {
  const main = resolve('narrative/main.ink');
  const compiler = new Compiler(
    readFileSync(main, 'utf8'),
    new CompilerOptions(main, [], false, null, {
      ResolveInkFilename: (file, source) =>
        resolve(dirname(source ?? main), file),
      LoadInkFileContents: (file) =>
        overrides[relative(process.cwd(), file).replaceAll('\\', '/')] ??
        readFileSync(file, 'utf8'),
    }),
  );
  const story = compiler.Compile();
  if (compiler.errors.length || compiler.warnings.length)
    throw new Error([...compiler.errors, ...compiler.warnings].join('\n'));
  const json = story.ToJson();
  if (typeof json !== 'string')
    throw new Error('Production compiler did not return JSON');
  return json;
}

export function compileDemo() {
  mkdirSync('generated/narrative', { recursive: true });
  writeFileSync(demoOutput, compileDemoText());
}

export function validateDemoSources(
  sources: Readonly<Record<string, string>>,
  refs: FixtureReferences = references,
) {
  const approved = readApprovedDemoContent();
  const ids = new Set<string>();
  for (const row of readEditorialRows()) {
    if (row.kind !== 'button' && refs.lines[row.id] !== row.scene)
      throw new Error(`Wrong scene reference: ${row.id}`);
  }
  const eventIds: string[] = [];
  for (const source of Object.values(sources)) {
    for (const row of source.split(/\r?\n/)) {
      const match = /# line:(demo\.[A-Za-z0-9.-]+)/.exec(row);
      if (!match) continue;
      const id = match[1];
      if (ids.has(id)) throw new Error(`Duplicate production Line ID: ${id}`);
      ids.add(id);
      const expected = approved.get(id.slice(5));
      const text = row
        .trim()
        .replace(/^\+ \[/, '')
        .split(' # ')[0];
      if (!expected || text !== expected.text)
        throw new Error(`Unapproved/changed text: ${id}`);
      if (!Object.hasOwn(refs.lines, id))
        throw new Error(`Missing production reference: ${id}`);
      const events = [...row.matchAll(/# event:([^ \]]+)/g)].map((m) => m[1]);
      const definition = demoFactDefinitions.find(
        ([, line]) => `demo.${line}` === id,
      );
      const expectedEvents = definition ? [`demo.domain.${definition[0]}`] : [];
      if (JSON.stringify(events) !== JSON.stringify(expectedEvents))
        throw new Error(`Wrong event timing/evidence: ${id}`);
      eventIds.push(...events);
      if (row.trim().startsWith('+ [')) {
        if (!row.endsWith(']') || /# speaker:/.test(row))
          throw new Error(`Invalid choice: ${id}`);
      } else {
        const speaker = /# speaker:([^ ]+)/.exec(row)?.[1];
        const label =
          expected.speaker.includes('UI') || expected.speaker === 'ผู้บรรยาย'
            ? ''
            : expected.speaker;
        if (!speaker || demoSpeakerLabels[speaker] !== label)
          throw new Error(`Unapproved speaker: ${id}`);
      }
    }
  }
  if (
    ids.size !== Object.keys(refs.lines).length ||
    ids.size !== approved.size ||
    [...approved.keys()].some((id) => !ids.has(`demo.${id}`))
  )
    throw new Error('Production reference mismatch');
  if (
    JSON.stringify([...eventIds].sort()) !==
    JSON.stringify([...refs.events].sort())
  )
    throw new Error('Production event reference mismatch');
}

export function expectedEditorialRoute(
  rows: readonly EditorialRow[],
  decisions: Readonly<Record<string, string>>,
) {
  const sequence: EditorialRow[] = [];
  for (const scene of new Set(rows.map((row) => row.scene))) {
    const prefix = rows.find((r) => r.scene === scene)!.id.slice(5, 9);
    const first = decisions[`demo.${prefix}-C01`] ?? 'A';
    const second = decisions[`demo.${prefix}-C02`] ?? 'A';
    const blocks = ['entry'];
    if (scene === 'SC-D2-03')
      blocks.push(
        (decisions['demo.D103-C01'] ?? 'A') === 'A' ? 'T' : 'F',
        'R00',
      );
    if (scene !== 'DEMO_END') {
      blocks.push('C01', `C01-${first}`);
      if (scene === 'SC-D2-02' && first === 'B')
        blocks.push('C02', `C02-${second}`);
      blocks.push('R01');
      if (scene === 'SC-D1-03' || scene === 'SC-D3-03')
        blocks.push('C02', `C02-${second}`, 'R02');
    }
    for (const block of blocks)
      sequence.push(
        ...rows.filter(
          (r) => r.scene === scene && r.block === block && r.kind !== 'button',
        ),
      );
  }
  return sequence.map((r) => r.id);
}

export function validateDemoRuntime(
  compiled: string,
  refs: FixtureReferences = references,
) {
  const approved = readApprovedDemoContent();
  const editorial = readEditorialRows();
  // Deterministic complete runs cover both callback states, every branch and rejoin.
  const visited = new Set<string>();
  for (let route = 0; route < 64; route++) {
    const store = createDemoDomainStore();
    const controller = new NarrativeController(
      compiled,
      refs,
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
    const decisions: Record<string, string> = {};
    const sequence: string[] = [];
    const facts: string[] = [];
    while (controller.getSnapshot().phase !== 'ended') {
      if (++step > approved.size * 2)
        throw new Error('Production traversal did not terminate');
      const view = controller.getSnapshot();
      if (view.phase === 'error')
        throw new Error(view.error ?? 'Production error');
      if (view.phase === 'line' && view.line) {
        visited.add(view.line.id);
        sequence.push(view.line.id);
        const definition = demoFactDefinitions.find(
          ([, id]) => view.line?.id === `demo.${id}`,
        );
        if (definition) facts.push(`demo.domain.${definition[0]}`);
        const expected = approved.get(view.line.id.slice(5));
        if (expected?.text !== view.line.text)
          throw new Error(`Runtime text differs: ${view.line.id}`);
        const authored = editorial.find((r) => r.id === view.line?.id);
        if (authored && authored.scene !== view.presentation.sceneId)
          throw new Error(`Runtime scene differs: ${view.line.id}`);
        const labels = demoSpeakerLabels;
        const expectedLabel =
          expected.speaker.includes('UI') || expected.speaker === 'ผู้บรรยาย'
            ? ''
            : expected.speaker;
        if (labels[view.presentation.speaker] !== expectedLabel)
          throw new Error(`Unapproved speaker label: ${view.line.id}`);
        if (
          JSON.stringify(store.getState().committedEventIds) !==
          JSON.stringify(facts)
        )
          throw new Error(`Runtime event timing differs: ${view.line.id}`);
        controller.continue(view);
      } else if (view.phase === 'choice') {
        const index =
          view.choices.length === 1 ? 0 : (route >> (choice++ % 6)) & 1;
        for (const item of view.choices) {
          if (approved.get(item.id.slice(5))?.text !== item.text)
            throw new Error('Unapproved choice text');
          visited.add(item.id);
          sequence.push(item.id);
        }
        if (
          JSON.stringify(store.getState().committedEventIds) !==
          JSON.stringify(facts)
        )
          throw new Error('Premature choice effect');
        decisions[view.choices[index].id.slice(0, -2)] =
          view.choices[index].id.slice(-1);
        controller.choose(view, index);
      } else throw new Error(`Unexpected production phase: ${view.phase}`);
    }
    const expectedSequence = [...approved.keys()]
      .filter((id) => /^D1[NP]-/.test(id))
      .map((id) => `demo.${id}`)
      .concat(expectedEditorialRoute(editorial, decisions));
    if (JSON.stringify(sequence) !== JSON.stringify(expectedSequence))
      throw new Error(`Unapproved route/order/duplicate output: run ${route}`);
    controller.dispose();
  }
  for (const id of Object.keys(refs.lines))
    if (!visited.has(id))
      throw new Error(`Unvisited production line/choice: ${id}`);
  return { linesAndChoices: visited.size, runs: 64 };
}

export function validateDemo() {
  const sources = Object.fromEntries(
    ['prologue.ink', 'days/day01.ink', 'days/day02.ink', 'days/day03.ink'].map(
      (file) => [file, readFileSync(`narrative/${file}`, 'utf8')],
    ),
  );
  validateDemoSources(sources);
  return validateDemoRuntime(readFileSync(demoOutput, 'utf8'));
}
