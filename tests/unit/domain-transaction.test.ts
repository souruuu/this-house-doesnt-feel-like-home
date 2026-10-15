import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { Story } from 'inkjs';
import references from '../../narrative/fixtures/references.json';
import { fixtureOutput } from '../../scripts/narrative-compile.ts';
import { validateCompiledFixture } from '../../scripts/narrative-validate.ts';
import { createFixtureEventRegistry } from '../../src/narrative/EventRegistry.ts';
import { NarrativeController } from '../../src/narrative/NarrativeController.ts';
import {
  bindFixtureQueries,
  createNarrativeQueryPort,
  type NarrativeQueryPort,
} from '../../src/narrative/NarrativeQueryPort.ts';
import {
  createFixtureDomainStore,
  initialFixtureState,
} from '../../src/state/fixtureDomainStore.ts';

const { Compiler } = createRequire(import.meta.url)(
  'inkjs/full',
) as typeof import('inkjs/full');
const registry = createFixtureEventRegistry();
const compiled = readFileSync(fixtureOutput, 'utf8');
function event(id: string) {
  const definition = registry.resolve(`fixture.domain.${id}`);
  if (definition.category !== 'domain')
    throw new Error('Expected domain event');
  return definition;
}
const a = event('branch_a');
const b = event('branch_b');
const rejoin = event('rejoined');

function make(
  input?: string,
  store = createFixtureDomainStore(),
  dispatch = vi.fn(),
  queries: NarrativeQueryPort = createNarrativeQueryPort(store),
) {
  const json =
    input === undefined ? compiled : new Compiler(input).Compile().ToJson();
  if (typeof json !== 'string') throw new Error('Missing compiled fixture');
  const controller = new NarrativeController(
    json,
    references,
    registry,
    queries,
    { dispatch },
    store,
  );
  return { controller, store, dispatch };
}
const multi = `-> m1_fixture
=== m1_fixture ===
# event:fixture.domain.branch_a
{""}
# event:fixture.domain.rejoined
{""}
ข้อความทดสอบ # line:fixture_rejoin_001 # event:fixture.presentation.rejoined
-> END`;

describe('fixture atomic domain commit', () => {
  it('publishes multiple effects and ledger together exactly once', () => {
    const store = createFixtureDomainStore();
    const observed: unknown[] = [];
    store.subscribe((state) =>
      observed.push({ count: state.effectCount, ids: state.committedEventIds }),
    );
    expect(store.commit([a, a, rejoin]).notificationError).toBeNull();
    expect(observed).toEqual([{ count: 2, ids: [a.id, rejoin.id] }]);
    const committed = store.getState();
    store.commit([a, rejoin]);
    expect(store.getState()).toBe(committed);
    expect(observed).toHaveLength(1);
    expect(Object.isFrozen(committed)).toBe(true);
    expect(Object.isFrozen(committed.flags)).toBe(true);
    expect(Object.isFrozen(committed.committedEventIds)).toBe(true);
    expect(Object.keys(store)).not.toContain('setState');
  });
  it('rejects the entire batch when a later precondition fails', () => {
    const store = createFixtureDomainStore();
    const before = store.getState();
    const listener = vi.fn();
    store.subscribe(listener);
    expect(() => store.commit([a, b])).toThrow('already selected');
    expect(store.getState()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
    expect(() => store.commit([rejoin, a])).toThrow('requires');
    expect(store.getState()).toBe(before);
    expect(store.commit([a]).notificationError).toBeNull();
  });
  it('retains committed facts when a Zustand subscriber throws', () => {
    const store = createFixtureDomainStore();
    const callback = vi.fn(() => {
      throw new Error('subscriber failed');
    });
    store.subscribe(callback);
    expect(store.commit([a, rejoin])).toEqual({
      notificationError: 'subscriber failed',
    });
    expect(store.getState()).toMatchObject({
      effectCount: 2,
      committedEventIds: [a.id, rejoin.id],
    });
    expect(store.commit([a, rejoin]).notificationError).toBeNull();
    expect(callback).toHaveBeenCalledTimes(1);
  });
  it('rejects nested domain commits during subscriber notification', () => {
    const store = createFixtureDomainStore();
    store.subscribe(() =>
      expect(() => store.commit([rejoin])).toThrow('locked'),
    );
    store.commit([a]);
    expect(store.getState().effectCount).toBe(1);
    expect(store.getState().committedEventIds).toEqual([a.id]);
  });
  it('keeps the ledger with an in-memory run seed, isolates a new run', () => {
    const original = createFixtureDomainStore();
    original.commit([a]);
    // Constructor seeding is tooling/integration input, not checkpoint restore.
    const recreated = createFixtureDomainStore(original.getState());
    recreated.commit([a]);
    expect(recreated.getState()).toEqual(original.getState());
    recreated.commit([rejoin]);
    expect(original.getState().effectCount).toBe(1);
    const fresh = createFixtureDomainStore();
    expect(fresh.getState().runId).not.toBe(original.getState().runId);
    expect(fresh.getState()).toMatchObject({
      effectCount: 0,
      committedEventIds: [],
      selectedBranch: null,
    });
  });
});

describe('controller transaction failure boundaries and callbacks', () => {
  it('validates the complete multi-output batch before domain commit, presentation and publish', () => {
    const { controller, store, dispatch } = make(multi);
    const order: string[] = [];
    store.subscribe((state) => {
      expect(state.committedEventIds).toHaveLength(2);
      order.push('domain');
    });
    dispatch.mockImplementation(() => {
      expect(store.getState().effectCount).toBe(2);
      order.push('presentation');
    });
    controller.subscribe(() => order.push('publish'));
    expect(controller.start()).toBe(true);
    expect(order).toEqual(['domain', 'presentation', 'publish']);
    expect(store.getState().effectCount).toBe(2);
  });
  it.each(['unknown:value', 'line:unknown', 'event:unknown'])(
    'fails closed before commit for late invalid output %s',
    (bad) => {
      const invalid = multi.replace(
        '# line:fixture_rejoin_001',
        `# ${bad} # line:fixture_rejoin_001`,
      );
      const { controller, store, dispatch } = make(invalid);
      const before = store.getState();
      expect(controller.start()).toBe(false);
      expect(store.getState()).toBe(before);
      expect(dispatch).not.toHaveBeenCalled();
      expect(controller.getSnapshot()).toMatchObject({
        phase: 'error',
        failureStage: 'pre-commit',
      });
      expect(controller.start()).toBe(false);
      expect(controller.continue(controller.getSnapshot())).toBe(false);
      expect(controller.choose(controller.getSnapshot(), 0)).toBe(false);
      controller.setPaused(true);
      controller.setPaused(false);
      expect(controller.continue(controller.getSnapshot())).toBe(false);
    },
  );
  it('fails closed for a precondition after Ink has advanced without partial effects', () => {
    const input = multi.replace(
      'fixture.domain.rejoined',
      'fixture.domain.branch_b',
    );
    const { controller, store, dispatch } = make(input);
    expect(controller.start()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'error',
      failureStage: 'pre-commit',
    });
    expect(store.getState().effectCount).toBe(0);
    expect(store.getState().committedEventIds).toEqual([]);
    expect(dispatch).not.toHaveBeenCalled();
    expect(controller.start()).toBe(false);
  });
  it('rejects a late invalid choice before committing preceding events', () => {
    const input = `-> m1_fixture\n=== m1_fixture ===\n# event:fixture.domain.branch_a\n+ [ทดสอบ # line:fixture_choice_a_001 # unknown:value]\n -> END`;
    const { controller, store } = make(input);
    expect(controller.start()).toBe(false);
    expect(store.getState().effectCount).toBe(0);
  });
  it.each(['domain-subscriber', 'presentation', 'view-subscriber'])(
    'retains commit and blocks retry after %s failure',
    (where) => {
      const { controller, store, dispatch } = make(multi);
      const fail = () => {
        throw new Error(`failed ${where}`);
      };
      if (where === 'domain-subscriber') store.subscribe(fail);
      if (where === 'presentation') dispatch.mockImplementation(fail);
      if (where === 'view-subscriber') controller.subscribe(fail);
      expect(controller.start()).toBe(false);
      const committed = store.getState();
      expect(committed.effectCount).toBe(2);
      expect(committed.committedEventIds).toEqual([a.id, rejoin.id]);
      expect(controller.getSnapshot()).toMatchObject({
        phase: 'error',
        failureStage: 'post-commit',
      });
      const dispatchCalls = dispatch.mock.calls.length;
      expect(controller.start()).toBe(false);
      expect(controller.continue(controller.getSnapshot())).toBe(false);
      expect(controller.choose(controller.getSnapshot(), 0)).toBe(false);
      expect(store.getState()).toBe(committed);
      expect(dispatch).toHaveBeenCalledTimes(dispatchCalls);
    },
  );
  it('blocks reentrant intentions in domain, presentation and view subscribers', () => {
    const { controller, store, dispatch } = make();
    controller.start();
    controller.continue(controller.getSnapshot());
    const choice = controller.getSnapshot();
    const reenter = () => {
      expect(controller.choose(choice, 0)).toBe(false);
      expect(controller.continue(controller.getSnapshot())).toBe(false);
      expect(controller.start()).toBe(false);
    };
    store.subscribe(reenter);
    dispatch.mockImplementation(reenter);
    controller.subscribe(reenter);
    expect(controller.choose(choice, 0)).toBe(true);
    expect(controller.choose(choice, 0)).toBe(false);
    controller.continue(controller.getSnapshot());
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(store.getState().effectCount).toBe(1);
  });
  it('reuses an active run across view unsubscribe/resubscribe without replay', () => {
    const { controller, store, dispatch } = make();
    const unsubscribe = controller.subscribe(vi.fn());
    controller.start();
    controller.continue(controller.getSnapshot());
    controller.choose(controller.getSnapshot(), 1);
    const before = controller.getSnapshot();
    unsubscribe();
    const resubscribed = vi.fn();
    controller.subscribe(resubscribed);
    expect(controller.start()).toBe(false);
    expect(controller.getSnapshot()).toBe(before);
    expect(store.getState().committedEventIds).toEqual([b.id]);
    expect(dispatch).toHaveBeenCalledTimes(1);
    controller.dispose();
    const next = make();
    next.controller.start();
    expect(next.store.getState().runId).not.toBe(store.getState().runId);
    expect(next.controller.choose(before, 1)).toBe(false);
  });
  it('retains the ledger when a controller is replaced within the same in-memory run', () => {
    const old = make();
    old.controller.start();
    old.controller.continue(old.controller.getSnapshot());
    old.controller.choose(old.controller.getSnapshot(), 0);
    const stale = old.controller.getSnapshot();
    old.controller.dispose();
    const replacement = make(undefined, old.store);
    replacement.controller.start();
    replacement.controller.continue(replacement.controller.getSnapshot());
    expect(replacement.controller.choose(stale, 0)).toBe(false);
    replacement.controller.choose(replacement.controller.getSnapshot(), 0);
    expect(old.store.getState().effectCount).toBe(1);
    expect(old.store.getState().committedEventIds).toEqual([a.id]);
  });
  it('treats an empty callback error as post-commit failure too', () => {
    const { controller, store, dispatch } = make(multi);
    store.subscribe(() => {
      throw new Error('');
    });
    expect(controller.start()).toBe(false);
    expect(controller.getSnapshot().failureStage).toBe('post-commit');
    expect(store.getState().effectCount).toBe(2);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('real inkjs authoritative query timing', () => {
  const directions = [
    { flag: 'fixture.branch_committed', before: false, after: true },
    { flag: 'fixture.branch_pending', before: true, after: false },
  ];
  it.each(directions)(
    'evaluates choice conditions only after $flag commits $before → $after',
    ({ flag, before, after }) => {
      const store = createFixtureDomainStore();
      const port = createNarrativeQueryPort(store);
      const read = vi.fn((id: string) => port.getFlag(id));
      const input = `EXTERNAL fixture_flag(id)
-> m1_fixture
=== m1_fixture ===
commit boundary # line:fixture_start_001 # event:fixture.domain.branch_a
+ {fixture_flag("${flag}")} [true # line:fixture_choice_a_001]
 -> END
+ {not fixture_flag("${flag}")} [false # line:fixture_choice_b_001]
 -> END`;
      const { controller } = make(input, store, vi.fn(), { getFlag: read });
      expect(port.getFlag(flag)).toBe(before);
      expect(controller.start()).toBe(true);
      expect(port.getFlag(flag)).toBe(after);
      expect(read).not.toHaveBeenCalled();
      expect(controller.getSnapshot().choices).toEqual([]);
      expect(controller.continue(controller.getSnapshot())).toBe(true);
      expect(
        controller.getSnapshot().choices.map((choice) => choice.id),
      ).toEqual([after ? 'fixture_choice_a_001' : 'fixture_choice_b_001']);
      expect(read.mock.results.map((result) => result.value)).toEqual([
        after,
        after,
      ]);
      expect(store.getState().effectCount).toBe(1);
    },
  );
  it.each(
    directions.flatMap((direction) =>
      [
        'temporary-condition',
        'inline-interpolation',
        'temporary-quoted-string',
        'temporary-choice-text',
      ].map((form) => ({ ...direction, form })),
    ),
  )(
    'reads latest $flag in $form through the controller',
    ({ flag, before, after, form }) => {
      const tail =
        form === 'temporary-condition'
          ? `~ temp current = fixture_flag("${flag}")\n{current:true|false} # line:fixture_branch_a_001\n-> END`
          : form === 'inline-interpolation'
            ? `value {fixture_flag("${flag}")} # line:fixture_branch_a_001\n-> END`
            : form === 'temporary-quoted-string'
              ? `~ temp current = fixture_flag("${flag}")\n~ temp label = "value {current}"\n{label} # line:fixture_branch_a_001\n-> END`
              : `~ temp current = fixture_flag("${flag}")\n+ [value {current} # line:fixture_choice_a_001]\n -> END`;
      const input = `EXTERNAL fixture_flag(id)\n-> m1_fixture\n=== m1_fixture ===\ncommit boundary # line:fixture_start_001 # event:fixture.domain.branch_a\n${tail}`;
      const store = createFixtureDomainStore();
      const port = createNarrativeQueryPort(store);
      const read = vi.fn((id: string) => port.getFlag(id));
      const { controller } = make(input, store, vi.fn(), { getFlag: read });
      expect(port.getFlag(flag)).toBe(before);
      expect(controller.start()).toBe(true);
      expect(read).not.toHaveBeenCalled();
      expect(port.getFlag(flag)).toBe(after);
      expect(controller.continue(controller.getSnapshot())).toBe(true);
      expect(read.mock.results.map((result) => result.value)).toEqual([after]);
      if (form === 'temporary-choice-text') {
        expect(controller.getSnapshot().phase).toBe('choice');
        expect(
          controller.getSnapshot().choices.map((choice) => choice.text),
        ).toEqual([`value ${after}`]);
      } else {
        expect(controller.getSnapshot().phase).toBe('line');
        expect(controller.getSnapshot().line?.text).toBe(
          form === 'temporary-condition' ? String(after) : `value ${after}`,
        );
        expect(controller.continue(controller.getSnapshot())).toBe(true);
        expect(controller.getSnapshot().phase).toBe('ended');
      }
      expect(store.getState().effectCount).toBe(1);
    },
  );
  it.each(
    ['choice-text', 'quoted-string'].flatMap((form) =>
      ['startup', 'after-commit'].map((stage) => ({ form, stage })),
    ),
  )('fails closed on direct query in $form at $stage', ({ form, stage }) => {
    const tail =
      form === 'choice-text'
        ? '+ [value {fixture_flag("fixture.branch_committed")} # line:fixture_choice_a_001]\n -> END'
        : '~ temp label = "value {fixture_flag("fixture.branch_committed")}"\n{label} # line:fixture_branch_a_001\n-> END';
    const prefix =
      stage === 'startup'
        ? '# event:fixture.domain.branch_a'
        : 'commit boundary # line:fixture_start_001 # event:fixture.domain.branch_a';
    const input = `EXTERNAL fixture_flag(id)\n-> m1_fixture\n=== m1_fixture ===\n${prefix}\n${tail}`;
    const { controller, store, dispatch } = make(input);
    if (stage === 'after-commit') expect(controller.start()).toBe(true);
    const before = store.getState();
    expect(
      stage === 'startup'
        ? controller.start()
        : controller.continue(controller.getSnapshot()),
    ).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'error',
      failureStage: 'pre-commit',
    });
    expect(controller.getSnapshot().error).toMatch(/string generation/);
    expect(store.getState()).toBe(before);
    expect(store.getState().effectCount).toBe(stage === 'startup' ? 0 : 1);
    expect(store.getState().committedEventIds).toEqual(
      stage === 'startup' ? [] : [a.id],
    );
    expect(dispatch).not.toHaveBeenCalled();
    expect(controller.start()).toBe(false);
    expect(controller.continue(controller.getSnapshot())).toBe(false);
  });
  it.each(['leading-glue', 'trailing-glue', 'temporary-with-glue'])(
    'keeps %s in one output and commits only after that complete output',
    (form) => {
      const joined =
        form === 'leading-glue'
          ? 'prefix # event:fixture.domain.branch_a\n<> {fixture_flag("fixture.branch_committed"):committed|pending}'
          : form === 'trailing-glue'
            ? '# event:fixture.domain.branch_a\nprefix <>\n{fixture_flag("fixture.branch_committed"):committed|pending}'
            : '# event:fixture.domain.branch_a\nprefix <>\n~ temp current = fixture_flag("fixture.branch_committed")\n{current:committed|pending}';
      const input = `EXTERNAL fixture_flag(id)\n-> m1_fixture\n=== m1_fixture ===\n${joined} # line:fixture_start_001\nnext {fixture_flag("fixture.branch_committed")} # line:fixture_branch_a_001\n-> END`;
      const store = createFixtureDomainStore();
      const port = createNarrativeQueryPort(store);
      const read = vi.fn((id: string) => port.getFlag(id));
      const { controller } = make(input, store, vi.fn(), { getFlag: read });
      expect(controller.start()).toBe(true);
      expect(controller.getSnapshot().line).toMatchObject({
        id: 'fixture_start_001',
      });
      expect(controller.getSnapshot().line?.text).toMatch(/^prefix\s*pending$/);
      expect(read.mock.results.map((result) => result.value)).toEqual([false]);
      expect(store.getState().effectCount).toBe(1);
      expect(controller.continue(controller.getSnapshot())).toBe(true);
      expect(controller.getSnapshot().line).toEqual({
        id: 'fixture_branch_a_001',
        text: 'next true',
      });
      expect(read.mock.results.map((result) => result.value)).toEqual([
        false,
        true,
      ]);
      expect(controller.continue(controller.getSnapshot())).toBe(true);
      expect(controller.getSnapshot().phase).toBe('ended');
      expect(store.getState().effectCount).toBe(1);
    },
  );
  it('rejects Glue/tag placement that merges two stable Line IDs into one output', () => {
    const input = `EXTERNAL fixture_flag(id)
-> m1_fixture
=== m1_fixture ===
prefix <> # event:fixture.domain.branch_a
{fixture_flag("fixture.branch_committed"):committed|pending} # line:fixture_start_001
next {fixture_flag("fixture.branch_committed")} # line:fixture_branch_a_001
-> END`;
    const { controller, store } = make(input);
    expect(controller.start()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'error',
      failureStage: 'pre-commit',
    });
    expect(controller.getSnapshot().error).toContain(
      'Duplicate singleton tag: line',
    );
    expect(store.getState().effectCount).toBe(0);
    expect(store.getState().committedEventIds).toEqual([]);
  });
  it('uses the runtime query policy during validator traversal', () => {
    const input = `EXTERNAL fixture_flag(id)
-> m1_fixture
=== m1_fixture ===
commit boundary # line:fixture_start_001 # event:fixture.domain.branch_a
~ temp current = fixture_flag("fixture.branch_committed")
{not current:
 ~ temp invalid = fixture_flag("fixture.unknown")
}
+ [valid # line:fixture_choice_a_001]
 -> END`;
    const refs = {
      ...references,
      scenes: { 'fixture.main': 'm1_fixture' },
      lines: {
        fixture_start_001: 'fixture.main',
        fixture_choice_a_001: 'fixture.main',
      },
      events: [a.id],
    };
    const json = new Compiler(input).Compile().ToJson();
    if (typeof json !== 'string') throw new Error('Missing compiled fixture');
    expect(validateCompiledFixture(input, json, refs)).toMatchObject({
      lineCount: 2,
      terminalPaths: 2,
    });
    const store = createFixtureDomainStore();
    const controller = new NarrativeController(
      json,
      refs,
      registry,
      createNarrativeQueryPort(store),
      { dispatch: vi.fn() },
      store,
    );
    expect(controller.start()).toBe(true);
    expect(controller.continue(controller.getSnapshot())).toBe(true);
    expect(controller.getSnapshot().choices.map((choice) => choice.id)).toEqual(
      ['fixture_choice_a_001'],
    );
    const invalid = input.replace(
      '[valid #',
      '[{fixture_flag("fixture.branch_committed")} #',
    );
    const invalidJson = new Compiler(invalid).Compile().ToJson();
    if (typeof invalidJson !== 'string')
      throw new Error('Missing compiled fixture');
    expect(() => validateCompiledFixture(invalid, invalidJson, refs)).toThrow(
      /string generation/,
    );
  });
  it.each([0, 1])(
    'reads committed facts after choice %s despite speculative lookahead',
    (index) => {
      const { controller, store } = make();
      controller.start();
      controller.continue(controller.getSnapshot());
      expect(store.getState().effectCount).toBe(0);
      controller.choose(controller.getSnapshot(), index);
      expect(store.getState().effectCount).toBe(1);
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot().line?.text).toContain(
        'ยืนยันข้อมูลหลังบันทึก',
      );
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot().phase).toBe('line');
      expect(store.getState().effectCount).toBe(2);
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot().phase).toBe('ended');
      expect(store.getState().effectCount).toBe(2);
    },
  );
  it('does not publish stale query-dependent choices after a readable domain commit', () => {
    const input = `EXTERNAL fixture_flag(id)
-> m1_fixture
=== m1_fixture ===
commit boundary # line:fixture_start_001 # event:fixture.domain.branch_a
+ {fixture_flag("fixture.branch_committed")} [committed # line:fixture_choice_a_001]
 -> END
+ {not fixture_flag("fixture.branch_committed")} [stale # line:fixture_choice_b_001]
 -> END`;
    const { controller, store } = make(input);
    expect(controller.start()).toBe(true);
    expect(store.getState().flags['fixture.branch_committed']).toBe(true);
    expect(store.getState().committedEventIds).toEqual([a.id]);
    expect(controller.continue(controller.getSnapshot())).toBe(true);
    expect(controller.getSnapshot().choices.map((choice) => choice.id)).toEqual(
      ['fixture_choice_a_001'],
    );
  });
  it.each(['inline', 'temporary'])(
    're-evaluates a %s query after a readable commit boundary',
    (kind) => {
      const store = createFixtureDomainStore(initialFixtureState());
      const tail =
        kind === 'inline'
          ? '{fixture_flag("fixture.branch_committed"):committed|stale}\n-> END'
          : '~ temp committed = fixture_flag("fixture.branch_committed")\n{committed:committed|stale}\n-> END';
      const input = `EXTERNAL fixture_flag(id)\n-> test\n=== test ===\ncommit boundary\n${tail}`;
      const json = new Compiler(input).Compile().ToJson();
      if (typeof json !== 'string') throw new Error('Missing compiled fixture');
      const story = new Story(json);
      const values: boolean[] = [];
      const queries = createNarrativeQueryPort(store);
      bindFixtureQueries(story, {
        getFlag(id) {
          const value = queries.getFlag(id);
          values.push(value);
          return value;
        },
      });
      expect(story.Continue()?.trim()).toBe('commit boundary');
      store.commit([a]);
      const output = story.canContinue ? story.Continue()?.trim() : undefined;
      expect(output).toBe('committed');
      expect(values.at(-1)).toBe(true);
    },
  );
});
