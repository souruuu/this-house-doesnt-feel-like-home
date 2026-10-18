import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  readEditorialRows,
  readApprovedDemoContent,
  parseEditorialScript,
  editorialDirectory,
} from '../../scripts/demo-content';
import {
  compileDemoText,
  validateDemoRuntime,
  validateDemoSources,
} from '../../scripts/narrative-production';
import { createDemoSession } from '../../src/narrative/demoSession';
import { resolveDemoCharacters } from '../../src/world/demoCharacterCues';
import references from '../../narrative/production/references.json';

const files = [
  'prologue.ink',
  'days/day01.ink',
  'days/day02.ink',
  'days/day03.ink',
];
const sources = () =>
  Object.fromEntries(
    files.map((f) => [f, readFileSync(`narrative/${f}`, 'utf8')]),
  );

describe('approved 04 editorial parity and negative validation', () => {
  it('accounts independently for every source row, retained ID, player line and navigation action', () => {
    const rows = readEditorialRows();
    expect(rows).toHaveLength(262);
    expect(rows.filter((r) => r.ref.startsWith('EM'))).toHaveLength(115);
    expect(new Set(rows.map((r) => r.scene)).size).toBe(10); // Nine scenes + UI ending.
    expect(readApprovedDemoContent().size).toBe(267);
    expect(rows.find((r) => r.ref === 'EM2-D103-NA03')?.text).toBe(
      'โห คิดเป็นเรื่องเป็นราวเลยนะ',
    );
    expect(
      rows.find((r) => r.ref === 'D202-L001')?.text.startsWith('ช่วงบ่าย'),
    ).toBe(true);
    expect(
      rows.find((r) => r.ref === 'D301-L001')?.text.startsWith('หลังเลิกเรียน'),
    ).toBe(true);
    expect(rows.filter((r) => r.kind === 'button').map((r) => r.ref)).toEqual([
      'D3E-C01-A',
    ]);
    expect(
      rows
        .filter((r) => r.speaker === 'player')
        .every((r) => r.kind === 'line'),
    ).toBe(true);
    validateDemoSources(sources());
  });

  it.each([
    'mutated-text',
    'duplicate-id',
    'missing-reference',
    'wrong-event-timing',
  ])(
    'rejects %s without changing files or weakening source authority',
    (mutation) => {
      const source = sources();
      const refs = structuredClone(references);
      if (mutation === 'mutated-text')
        source['days/day01.ink'] = source['days/day01.ink'].replace(
          'โห คิดเป็นเรื่องเป็นราวเลยนะ',
          'ข้อความที่ไม่ได้อนุมัติ',
        );
      if (mutation === 'duplicate-id')
        source['days/day01.ink'] +=
          '\n' +
          source['days/day01.ink']
            .split('\n')
            .find((s) => s.includes('line:demo.D101-L001'));
      if (mutation === 'missing-reference')
        delete (refs.lines as Record<string, string>)['demo.D101-L001'];
      if (mutation === 'wrong-event-timing')
        source['days/day01.ink'] = source['days/day01.ink']
          .replace(' # event:demo.domain.nut_food_interest', '')
          .replace(
            '# line:demo.D103-EM2-NA03 # speaker:player',
            '# line:demo.D103-EM2-NA03 # speaker:player # event:demo.domain.nut_food_interest',
          );
      expect(() => validateDemoSources(source, refs)).toThrow();
    },
  );

  it('rejects an unapproved compiled route even when individual texts and IDs are valid', () => {
    const source = sources()['days/day01.ink'].replace(
      '-> d101_r01',
      '-> sc_d1_02',
    );
    expect(() =>
      validateDemoRuntime(
        compileDemoText({ 'narrative/days/day01.ink': source }),
      ),
    ).toThrow('route/order');
  });

  it('rejects duplicated editorial declarations and never reads historical §1A wording', () => {
    const file =
      'day1/Narrative_Emotional_Revision_SC-D1-03_v0.2.1_Owner_Approved.md';
    const raw = readFileSync(`${editorialDirectory}/${file}`, 'utf8');
    const rows = parseEditorialScript(raw, file);
    expect(rows.filter((r) => r.ref === 'EM2-D103-NA03')).toHaveLength(1);
    expect(() =>
      parseEditorialScript(
        raw.replace(
          '## 1A.',
          '**[บทพูด — ผู้เล่น | `EM2-D103-NA03`]**\n“ซ้ำ”\n\n## 1A.',
        ),
        file,
      ),
    ).toThrow('Duplicate');
  });
});

describe('editorial evidence timing, actor continuity and guards', () => {
  it.each([
    ['A', 'A', 'A'],
    ['B', 'A', 'B'],
    ['B', 'B', 'A'],
  ] as const)(
    'retains exact evidence boundaries, route and character through new text: %s/%s/%s',
    (somFirst, somSecond, kan) => {
      for (const food of ['A', 'B']) {
        const session = createDemoSession();
        const rows = new Map(readEditorialRows().map((r) => [r.id, r]));
        const seen = new Set<string>();
        const decisions: Record<string, string> = {
          'demo.D103-C01': food,
          'demo.D202-C01': somFirst,
          'demo.D202-C02': somSecond,
          'demo.D303-C02': kan,
        };
        session.controller.start();
        for (let step = 0; step < 400; step++) {
          const view = session.controller.getSnapshot();
          if (view.phase === 'ended') break;
          if (view.phase === 'line' && view.line) {
            const row = rows.get(view.line.id);
            if (row) {
              expect(view.line.text).toBe(row.text);
              expect(view.presentation.speaker).toBe(row.speaker);
            }
            seen.add(view.line.id);
            for (const [flag, evidence] of [
              ['nut_food_interest', 'D103-L005A'],
              ['som_food_accepted', 'D202-L007A'],
              ['kan_name', 'D303-L010A'],
            ] as const)
              expect(session.store.getState().flags[flag]).toBe(
                seen.has(`demo.${evidence}`),
              );
            if (row?.speaker === 'player' && !row.ref.includes('D103-K'))
              expect(resolveDemoCharacters(view)).toHaveLength(1);
            if (!seen.has('demo.D303-L010A'))
              expect(view.line.text).not.toContain('กันต์');
            if (view.line.id === 'demo.D303-L010A')
              expect(view.presentation.speaker).toBe('awning_boy');
            if (view.line.id === 'demo.D103-EM2-NA03')
              expect(session.store.getState().flags.nut_food_interest).toBe(
                false,
              );
            const ids = session.store.getState().committedEventIds;
            expect(new Set(ids).size).toBe(ids.length);
            session.controller.continue(view);
            expect(session.controller.continue(view)).toBe(false);
          } else if (view.phase === 'choice') {
            const group = view.choices[0].id.slice(0, -2);
            const selected = view.choices.find((c) =>
              c.id.endsWith('-' + (decisions[group] ?? 'A')),
            )!;
            session.controller.choose(view, selected.index);
            expect(session.controller.choose(view, selected.index)).toBe(false);
          } else throw new Error(view.error ?? view.phase);
        }
        expect(session.controller.getSnapshot().phase).toBe('ended');
        expect(seen.has(`demo.D203-L003${food === 'A' ? 'T' : 'F'}`)).toBe(
          true,
        );
        expect(session.store.getState().flags.kan_name).toBe(kan === 'A');
        expect(session.store.getState().flags.som_food_accepted).toBe(
          somFirst === 'B' && somSecond === 'A',
        );
        for (const b of session.controller.getBacklog()) {
          expect(b.text).not.toMatch(/\[กำกับ|Shared Rejoin|FACT-BEARING/);
        }
        session.controller.dispose();
      }
    },
  );
});
