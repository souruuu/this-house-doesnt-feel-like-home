import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createDemoSession } from '../../src/narrative/demoSession.ts';
import { createDemoEventRegistry } from '../../src/narrative/demoEvents.ts';
import { createDemoDomainStore } from '../../src/state/demoDomainStore.ts';
import { parseOutput, resetPresentation } from '../../src/narrative/tags.ts';
import references from '../../narrative/production/references.json';
import { validateDemo } from '../../scripts/narrative-production.ts';
import type { DomainEvent, NarrativeView } from '../../src/narrative/types.ts';

function play(decisions: Record<string, 'A' | 'B'> = {}) {
  const session = createDemoSession();
  const views: NarrativeView[] = [];
  session.controller.start();
  for (let step = 0; step < 400; step++) {
    const view = session.controller.getSnapshot();
    views.push(view);
    if (view.phase === 'ended') return { ...session, views };
    if (view.phase === 'line') session.controller.continue(view);
    else if (view.phase === 'choice') {
      const group = view.choices[0].id.slice(0, -2);
      const target = view.choices.find((item) =>
        item.id.endsWith(`-${decisions[group] ?? 'A'}`),
      );
      session.controller.choose(view, target?.index ?? 0);
    } else throw new Error(view.error ?? 'Unexpected phase');
  }
  throw new Error('Demo did not terminate');
}

describe('approved emergency production narrative', () => {
  it('preserves original source bytes and verifies every approved line/choice through the actual controller', () => {
    expect(
      createHash('sha256')
        .update(readFileSync('sources/narrative_map_7_day_Updates.md'))
        .digest('hex'),
    ).toBe('b0ec03e7d54a4aaf1d7976d4cd585d8a982d83d415edabe3f1b272a5dee04cdb');
    // 262 independently parsed editorial rows - 1 React button + 6 Notice/Prologue.
    expect(validateDemo()).toEqual({ linesAndChoices: 267, runs: 64 });
  });

  it.each([true, false])(
    'Nut callback uses only the actual D1 disclosure, told=%s',
    (told) => {
      const result = play({ 'demo.D103-C01': told ? 'A' : 'B' });
      const lines = result.views
        .filter((view) => view.phase === 'line')
        .map((view) => view.line?.id);
      expect(lines).toContain(`demo.D203-L003${told ? 'T' : 'F'}`);
      expect(lines).not.toContain(`demo.D203-L003${told ? 'F' : 'T'}`);
      expect(result.store.getState().flags.nut_food_interest).toBe(told);
      expect(
        result.store
          .getState()
          .facts.filter((fact) => fact.fact === 'nut_food_interest'),
      ).toEqual(
        told
          ? [
              expect.objectContaining({
                evidenceLineId: 'demo.D103-L005A',
                owner: 'nut',
                knowledge: 'told',
              }),
            ]
          : [],
      );
      result.controller.dispose();
    },
  );

  it.each([true, false])(
    'Kan names himself only on the name branch=%s',
    (named) => {
      const result = play({ 'demo.D303-C02': named ? 'A' : 'B' });
      const lines = result.views.filter((view) => view.phase === 'line');
      const nameIndex = lines.findIndex(
        (view) => view.line?.id === 'demo.D303-L010A',
      );
      if (named) {
        expect(lines[nameIndex].presentation.speaker).toBe('awning_boy');
        expect(
          lines
            .slice(0, nameIndex)
            .every(
              (view) =>
                !view.line?.text.includes('กันต์') &&
                view.presentation.speaker !== 'kan',
            ),
        ).toBe(true);
        expect(lines[nameIndex + 1].line?.id).toBe('demo.D303-L011A');
      } else
        expect(
          lines.every(
            (view) =>
              !view.line?.text.includes('กันต์') &&
              view.presentation.speaker !== 'kan',
          ),
        ).toBe(true);
      expect(result.store.getState().flags.kan_name).toBe(named);
      result.controller.dispose();
    },
  );

  it.each([
    ['A', 'A', 'P', false],
    ['B', 'A', 'A', true],
    ['B', 'B', 'N', false],
  ] as const)(
    'Som purchase outcome %s/%s yields only its approved response',
    (first, second, response, accepted) => {
      const result = play({ 'demo.D202-C01': first, 'demo.D202-C02': second });
      const lines = result.views.map((view) => view.line?.id);
      for (const variant of ['P', 'A', 'N']) {
        expect(lines.includes(`demo.D202-L007${variant}`)).toBe(
          variant === response,
        );
      }
      expect(result.store.getState().flags.som_food_accepted).toBe(accepted);
      result.controller.dispose();
    },
  );

  it.each(['A', 'B'] as const)(
    'shelf cleanup %s observes two items and commits only one cleanup',
    (branch) => {
      const result = play({ 'demo.D303-C01': branch });
      expect(result.store.getState().flags.kan_shelf_incident).toBe(true);
      expect(result.store.getState().flags.shelf_restored_by_owner).toBe(
        branch === 'A',
      );
      expect(result.store.getState().flags.shelf_restored_together).toBe(
        branch === 'B',
      );
      result.controller.dispose();
    },
  );

  it('preserves terminal-line Continue, stale input, pause and new-run isolation', () => {
    const first = createDemoSession();
    first.controller.start();
    const stale = first.controller.getSnapshot();
    first.controller.setPaused(true);
    expect(first.controller.continue(stale)).toBe(false);
    first.controller.setPaused(false);
    expect(first.controller.continue(stale)).toBe(false);
    expect(first.controller.getSnapshot().line?.id).toBe('demo.D1N-L001');
    first.controller.dispose();
    const result = play();
    const terminal = result.views.at(-2)!;
    expect(terminal.phase).toBe('line');
    expect(terminal.line?.id).toBe('demo.D3E-L002');
    expect(result.views.at(-1)?.phase).toBe('ended');
    const next = createDemoSession();
    expect(next.store.getState().runId).not.toBe(result.store.getState().runId);
    expect(next.store.getState().committedEventIds).toEqual([]);
    expect(
      Object.values(next.store.getState().flags).every((flag) => !flag),
    ).toBe(true);
    result.controller.dispose();
    next.controller.dispose();
  });

  it('validates event evidence and rejects whole invalid batches without partial commit', () => {
    const registry = createDemoEventRegistry();
    const event = registry.resolve('demo.domain.nut_food_interest');
    expect(() =>
      parseOutput(
        ['line:demo.D103-L005B', 'event:demo.domain.nut_food_interest'],
        'ข้อความ',
        references,
        registry,
        resetPresentation('SC-D1-03'),
      ),
    ).toThrow('evidence');
    const store = createDemoDomainStore();
    expect(() =>
      store.commit(
        [registry.resolve('demo.domain.manao_name'), event].filter(
          (item): item is DomainEvent => item.category === 'domain',
        ),
      ),
    ).toThrow('encounter');
    expect(store.getState().committedEventIds).toEqual([]);
    expect(store.getState().flags.manao_name).toBe(false);
  });

  it('effects and ledger publish atomically; duplicate/reentrant callbacks cannot repeat commits', () => {
    const session = createDemoSession();
    const receipts: string[][] = [];
    session.store.subscribe((state) => {
      expect(state.committedEventIds.length).toBe(state.facts.length);
      receipts.push([...state.committedEventIds]);
      expect(
        session.controller.continue(session.controller.getSnapshot()),
      ).toBe(false);
    });
    session.controller.start();
    while (!session.store.getState().flags.manao_name) {
      const view = session.controller.getSnapshot();
      if (view.phase === 'line') session.controller.continue(view);
      else if (view.phase === 'choice') session.controller.choose(view, 0);
      else throw new Error(view.error ?? 'Unexpected phase');
    }
    const event = createDemoEventRegistry().resolve('demo.domain.manao_name');
    if (event.category !== 'domain') throw new Error('Expected domain event');
    session.store.commit([event]);
    expect(receipts).toHaveLength(1);
    session.controller.dispose();
  });
});
