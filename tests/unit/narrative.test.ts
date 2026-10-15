import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import references from '../../narrative/fixtures/references.json';
import {
  fixtureOutput,
  fixtureSource,
} from '../../scripts/narrative-compile.ts';
import {
  indexFixtureSource,
  validateCompiledFixture,
} from '../../scripts/narrative-validate.ts';
import {
  EventRegistry,
  createFixtureEventRegistry,
  fixtureEventDefinitions,
} from '../../src/narrative/EventRegistry.ts';
import { NarrativeController } from '../../src/narrative/NarrativeController.ts';
import {
  createNarrativeQueryPort,
  type FixtureFacts,
} from '../../src/narrative/NarrativeQueryPort.ts';
import { parseOutput, resetPresentation } from '../../src/narrative/tags.ts';
import type {
  FixtureReferences,
  FixturePresentationPort,
} from '../../src/narrative/types.ts';

const require = createRequire(import.meta.url);
const { Compiler } = require('inkjs/full') as typeof import('inkjs/full');
const source = readFileSync(fixtureSource, 'utf8');
const compiled = readFileSync(fixtureOutput, 'utf8');
function compile(input: string) {
  const json = new Compiler(input).Compile().ToJson();
  if (typeof json !== 'string') throw new Error('Missing compiler output');
  return json;
}
function session(
  input = compiled,
  refs: FixtureReferences = references,
  registry = createFixtureEventRegistry(),
  presentation: FixturePresentationPort = { dispatch: vi.fn() },
  enabled = true,
) {
  const store = createStore<FixtureFacts>(() => ({
    flags: { 'fixture.branch_enabled': enabled },
  }));
  const controller = new NarrativeController(
    input,
    refs,
    registry,
    createNarrativeQueryPort(store),
    presentation,
  );
  return { controller, presentation, store };
}
function atChoice(controller: NarrativeController) {
  expect(controller.start()).toBe(true);
  expect(controller.continue(controller.getSnapshot())).toBe(true);
  expect(controller.getSnapshot().phase).toBe('choice');
}

describe('whole fixture traversal and source identities', () => {
  it('validates both branches for both explicit query inputs, including empty tagged output', () => {
    expect(validateCompiledFixture(source, compiled, references)).toEqual({
      lineCount: 8,
      terminalPaths: 4,
      tagOnlyOutputs: 2,
    });
  });
  it.each(['fixture_branch_a_001', 'fixture_branch_b_001'])(
    'finds invalid tags only on %s',
    (id) => {
      const invalid = source.replace(
        `# line:${id}`,
        `# line:${id} # unknown:value`,
      );
      expect(() =>
        validateCompiledFixture(invalid, compile(invalid), references),
      ).toThrow('Unknown/invalid tag');
    },
  );
  it.each(['line:fixture_start_001', 'event:fixture.presentation.started'])(
    'rejects duplicate source definition %s',
    (tag) => {
      expect(() =>
        indexFixtureSource(`${source}\n# ${tag}`, references),
      ).toThrow('Duplicate source ID');
    },
  );
  it('accepts the single rejoin definition visited from multiple branches', () => {
    expect(
      indexFixtureSource(source, references).has('line:fixture_rejoin_001'),
    ).toBe(true);
    expect(
      validateCompiledFixture(source, compiled, references).terminalPaths,
    ).toBe(4);
  });
  it('rejects a readable line whose stable identity was removed', () => {
    const invalid = source.replace(' # line:fixture_branch_b_001', '');
    expect(() =>
      validateCompiledFixture(invalid, compile(invalid), references),
    ).toThrow('Missing source Line ID');
  });
  it('rejects an unknown event found only after branching', () => {
    const invalid = source.replace(
      '# line:fixture_branch_b_001',
      '# line:fixture_branch_b_001 # event:fixture.unknown',
    );
    expect(() =>
      validateCompiledFixture(invalid, compile(invalid), references),
    ).toThrow('Unknown source Event ID');
  });
  it('terminates traversal of a looping fixture with a clear guard', () => {
    const invalid = source.replace('-> END', '-> m1_fixture');
    expect(() =>
      validateCompiledFixture(invalid, compile(invalid), references),
    ).toThrow(/limit exceeded/);
  });
});

describe('tag parsing and scene presentation context', () => {
  it.each(
    [
      ['line:fixture_start_001', 'unknown:value'],
      ['line:fixture_start_001', 'speaker:unknown'],
      ['line:fixture_start_001', 'expression:unknown'],
      ['line:fixture_start_001', 'position:unknown'],
      ['line:fixture_start_001', 'line:fixture_end_001'],
      ['line:unknown'],
      [
        'event:fixture.presentation.started',
        'event:fixture.presentation.started',
      ],
      [],
    ].map((tags) => ({ tags })),
  )('guards invalid readable output %j', ({ tags }) => {
    expect(() =>
      parseOutput(
        tags,
        'ข้อความทดสอบ',
        references,
        createFixtureEventRegistry(),
        resetPresentation('fixture.main'),
      ),
    ).toThrow();
  });
  it('allows tag-only output without creating a line identity', () => {
    const output = parseOutput(
      ['event:fixture.presentation.started'],
      '',
      references,
      createFixtureEventRegistry(),
      resetPresentation('fixture.main'),
    );
    expect(output.lineId).toBeUndefined();
    expect(output.event?.id).toBe('fixture.presentation.started');
  });
  it('persists context within a scene and resets every field in the next scene', () => {
    // Isolated registry doubles, not approved art/stage definitions.
    const refs: FixtureReferences = {
      ...references,
      speakers: ['none', 'probe'],
      expressions: {
        probe_expression: { speaker: 'probe', asset: 'probe_asset' },
      },
      assets: ['probe_asset'],
      positions: ['probe_position'],
    };
    const registry = createFixtureEventRegistry();
    const first = parseOutput(
      [
        'line:fixture_start_001',
        'speaker:probe',
        'expression:probe_expression',
        'position:probe_position',
      ],
      'probe',
      refs,
      registry,
      resetPresentation('fixture.main'),
    );
    const sameScene = parseOutput(
      ['line:fixture_branch_a_001'],
      'probe',
      refs,
      registry,
      first.context,
    );
    expect(sameScene.context).toEqual(first.context);
    const nextScene = parseOutput(
      ['line:fixture_rejoin_001'],
      'probe',
      refs,
      registry,
      sameScene.context,
    );
    expect(nextScene.context).toEqual(resetPresentation('fixture.rejoin'));
  });
  it('rejects wrong event scene and expression speaker/asset mappings', () => {
    expect(() =>
      parseOutput(
        ['line:fixture_rejoin_001', 'event:fixture.presentation.started'],
        'probe',
        references,
        createFixtureEventRegistry(),
        resetPresentation('fixture.main'),
      ),
    ).toThrow('scene mismatch');
    const refs: FixtureReferences = {
      ...references,
      expressions: { probe: { speaker: 'other', asset: 'missing' } },
    };
    expect(() =>
      parseOutput(
        ['line:fixture_start_001', 'expression:probe'],
        'probe',
        refs,
        createFixtureEventRegistry(),
        resetPresentation('fixture.main'),
      ),
    ).toThrow('expression');
  });
});

describe('registry and read-only Zustand queries', () => {
  it('rejects duplicate registry IDs and domain execution', () => {
    expect(
      () =>
        new EventRegistry([
          fixtureEventDefinitions[0],
          fixtureEventDefinitions[0],
        ]),
    ).toThrow('Duplicate Event ID');
    const registry = new EventRegistry([
      { ...fixtureEventDefinitions[0], category: 'domain' },
    ]);
    expect(() =>
      registry.resolvePresentation('fixture.presentation.started'),
    ).toThrow('outside Batch 1');
    expect(() =>
      createFixtureEventRegistry().resolvePresentation('unknown'),
    ).toThrow('Unknown event');
  });
  it('exposes only a frozen read port, reads current Zustand state, and rejects unknown facts', () => {
    const store = createStore<FixtureFacts>(() => ({ flags: { probe: true } }));
    const port = createNarrativeQueryPort(store);
    expect(Object.keys(port)).toEqual(['getFlag']);
    expect(Object.isFrozen(port)).toBe(true);
    expect(port.getFlag('probe')).toBe(true);
    store.setState({ flags: { probe: false } });
    expect(port.getFlag('probe')).toBe(false);
    expect(() => port.getFlag('unknown')).toThrow('Unknown query');
  });
  it('Ink reads both supplied query variants without mutating the facts', () => {
    for (const enabled of [true, false]) {
      const { controller, store } = session(
        compiled,
        references,
        createFixtureEventRegistry(),
        { dispatch: vi.fn() },
        enabled,
      );
      const before = store.getState();
      controller.start();
      expect(controller.getSnapshot().line?.id).toBe(
        enabled ? 'fixture_start_001' : 'fixture_start_disabled_001',
      );
      expect(store.getState()).toBe(before);
    }
  });
});

describe('controller dispatch and request acceptance', () => {
  it.each([0, 1])(
    'plays branch %s, shared rejoin and end with real inkjs',
    (index) => {
      const { controller, presentation } = session();
      atChoice(controller);
      expect(presentation.dispatch).toHaveBeenCalledTimes(1);
      expect(controller.getSnapshot().line?.id).toBe('fixture_start_001'); // tag-only output did not create a blank line
      controller.choose(controller.getSnapshot(), index);
      expect(controller.getSnapshot().line?.id).toBe(
        index ? 'fixture_branch_b_001' : 'fixture_branch_a_001',
      );
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot().line?.id).toBe('fixture_rejoin_001');
      expect(controller.getSnapshot().presentation).toEqual(
        resetPresentation('fixture.rejoin'),
      );
      expect(presentation.dispatch).toHaveBeenCalledTimes(2);
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot()).toMatchObject({
        phase: 'line',
        line: { id: 'fixture_end_001' },
        choices: [],
      });
      controller.continue(controller.getSnapshot());
      expect(controller.getSnapshot().phase).toBe('ended');
      expect(presentation.dispatch).toHaveBeenCalledTimes(2);
      expect(controller.continue(controller.getSnapshot())).toBe(false);
    },
  );
  it('waits for Continue on a terminal readable line without replay or stale input', () => {
    const input = `-> m1_fixture\n=== m1_fixture ===\nข้อความทดสอบสุดท้าย # line:fixture_start_001 # event:fixture.presentation.started\n-> END`;
    const { controller, presentation } = session(compile(input));
    const reentrantContinue = vi.fn((view) => {
      if (view.phase === 'line') expect(controller.continue(view)).toBe(false);
    });
    controller.subscribe(reentrantContinue);
    expect(controller.start()).toBe(true);
    const terminalRequest = controller.getSnapshot();
    expect(terminalRequest).toMatchObject({
      phase: 'line',
      line: { id: 'fixture_start_001' },
      choices: [],
    });
    expect(presentation.dispatch).toHaveBeenCalledTimes(1);
    expect(reentrantContinue).toHaveBeenCalledTimes(1);
    expect(
      controller.continue({ ...terminalRequest, sessionId: 'stale' }),
    ).toBe(false);
    expect(
      controller.continue({
        ...terminalRequest,
        revision: terminalRequest.revision - 1,
      }),
    ).toBe(false);
    expect(controller.getSnapshot()).toBe(terminalRequest);
    expect(controller.continue(terminalRequest)).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'ended',
      revision: terminalRequest.revision + 1,
      choices: [],
    });
    expect(controller.continue(terminalRequest)).toBe(false);
    expect(controller.continue(controller.getSnapshot())).toBe(false);
    expect(presentation.dispatch).toHaveBeenCalledTimes(1);
  });
  it('waits on a readable line before choices and clears choices at the terminal transition', () => {
    const input = `-> m1_fixture\n=== m1_fixture ===\nข้อความทดสอบ # line:fixture_start_001 # event:fixture.presentation.started\n+ [เลือกเส้นทางทดสอบ # line:fixture_choice_a_001]\n -> END`;
    const { controller, presentation } = session(compile(input));
    controller.start();
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'line',
      choices: [],
    });
    controller.continue(controller.getSnapshot());
    const choiceRequest = controller.getSnapshot();
    expect(choiceRequest.phase).toBe('choice');
    expect(choiceRequest.choices).toHaveLength(1);
    expect(controller.choose(choiceRequest, 0)).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'ended',
      choices: [],
    });
    expect(controller.choose(choiceRequest, 0)).toBe(false);
    expect(presentation.dispatch).toHaveBeenCalledTimes(1);
  });
  it.each(['unknown:value', 'line:unknown', 'event:fixture.unknown'])(
    'dispatches nothing for valid event followed by invalid tag %s',
    (bad) => {
      const input = `-> m1_fixture\n=== m1_fixture ===\n# event:fixture.presentation.started\nข้อความทดสอบ # line:fixture_start_001 # ${bad}\n-> END`;
      const { controller, presentation } = session(compile(input));
      expect(controller.start()).toBe(false);
      expect(controller.getSnapshot()).toMatchObject({
        phase: 'error',
        line: null,
        choices: [],
      });
      expect(presentation.dispatch).not.toHaveBeenCalled();
    },
  );
  it('validates all choices before dispatching the preceding tag-only event', () => {
    const input = `-> m1_fixture\n=== m1_fixture ===\n# event:fixture.presentation.started\n+ [ข้อความทดสอบ # line:fixture_choice_a_001 # unknown:value]\n -> END`;
    const { controller, presentation } = session(compile(input));
    controller.start();
    expect(controller.getSnapshot().phase).toBe('error');
    expect(presentation.dispatch).not.toHaveBeenCalled();
  });
  it('domain category fails before any fixture notification', () => {
    const registry = new EventRegistry([
      { ...fixtureEventDefinitions[0], category: 'domain' },
    ]);
    const { controller, presentation } = session(
      compiled,
      references,
      registry,
    );
    controller.start();
    controller.continue(controller.getSnapshot());
    expect(controller.getSnapshot().phase).toBe('error');
    expect(presentation.dispatch).not.toHaveBeenCalled();
  });
  it('rejects stale revision/session, duplicate continue/choice and invalid indexes', () => {
    const { controller, presentation } = session();
    controller.start();
    const lineRequest = controller.getSnapshot();
    expect(controller.continue(lineRequest)).toBe(true);
    expect(controller.continue(lineRequest)).toBe(false);
    const choiceRequest = controller.getSnapshot();
    for (const index of [-1, 2, NaN, 0.5])
      expect(controller.choose(choiceRequest, index)).toBe(false);
    expect(
      controller.choose({ ...choiceRequest, sessionId: 'old-session' }, 0),
    ).toBe(false);
    expect(controller.choose({ ...choiceRequest, revision: 0 }, 0)).toBe(false);
    expect(controller.choose(choiceRequest, 0)).toBe(true);
    expect(controller.choose(choiceRequest, 1)).toBe(false);
    expect(presentation.dispatch).toHaveBeenCalledTimes(1);
  });
  it('holds the input lock during presentation callbacks', () => {
    const dispatch = vi.fn(() =>
      expect(controller.continue(controller.getSnapshot())).toBe(false),
    );
    const controller = session(
      compiled,
      references,
      createFixtureEventRegistry(),
      {
        dispatch,
      },
    ).controller;
    atChoice(controller);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
  it('controller resets nonempty presentation context only at the next scene', () => {
    const refs: FixtureReferences = {
      ...references,
      speakers: ['none', 'probe'],
      expressions: {
        probe_expression: { speaker: 'probe', asset: 'probe_asset' },
      },
      assets: ['probe_asset'],
      positions: ['probe_position'],
    };
    const input = `-> m1_fixture\n=== m1_fixture ===\nข้อความทดสอบ # line:fixture_start_001 # speaker:probe # expression:probe_expression # position:probe_position\nข้อความทดสอบ # line:fixture_branch_a_001\n-> fixture_rejoin\n=== fixture_rejoin ===\nข้อความทดสอบ # line:fixture_rejoin_001\n-> END`;
    const { controller } = session(compile(input), refs);
    controller.start();
    const firstContext = controller.getSnapshot().presentation;
    controller.continue(controller.getSnapshot());
    expect(controller.getSnapshot().presentation).toEqual(firstContext);
    controller.continue(controller.getSnapshot());
    expect(controller.getSnapshot().presentation).toEqual(
      resetPresentation('fixture.rejoin'),
    );
  });
  it('blocks paused initial/line/choice input without changing revision or dispatch count', () => {
    const { controller, presentation } = session();
    controller.setPaused(true);
    expect(controller.start()).toBe(false);
    controller.setPaused(false);
    controller.start();
    controller.setPaused(true);
    const request = controller.getSnapshot();
    expect(controller.continue(request)).toBe(false);
    expect(controller.getSnapshot()).toBe(request);
    controller.setPaused(false);
    controller.continue(controller.getSnapshot());
    controller.setPaused(true);
    expect(controller.choose(controller.getSnapshot(), 0)).toBe(false);
    expect(presentation.dispatch).toHaveBeenCalledTimes(1);
  });
  it('invalidates pending intentions across pause/resume', () => {
    const { controller, presentation } = session();
    controller.start();
    const beforePause = controller.getSnapshot();
    controller.setPaused(true);
    controller.setPaused(false);
    expect(controller.continue(beforePause)).toBe(false);
    expect(presentation.dispatch).not.toHaveBeenCalled();
    expect(controller.continue(controller.getSnapshot())).toBe(true);
  });
  it('disposes subscriptions and rejects old requests after remount with a fresh context', () => {
    const old = session();
    const listener = vi.fn();
    const unsubscribe = old.controller.subscribe(listener);
    atChoice(old.controller);
    const oldRequest = old.controller.getSnapshot();
    unsubscribe();
    old.controller.dispose();
    old.controller.dispose();
    const calls = listener.mock.calls.length;
    expect(old.controller.choose(oldRequest, 0)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(calls);
    expect(() => old.controller.subscribe(listener)).toThrow('disposed');
    const next = session();
    next.controller.start();
    expect(next.controller.getSnapshot().sessionId).not.toBe(
      oldRequest.sessionId,
    );
    expect(next.controller.getSnapshot().presentation).toEqual(
      resetPresentation('fixture.main'),
    );
    expect(next.controller.continue(oldRequest)).toBe(false);
    expect(next.presentation.dispatch).not.toHaveBeenCalled();
  });
});
