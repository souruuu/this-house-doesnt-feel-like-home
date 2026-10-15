import { describe, expect, it, vi } from 'vitest';
import { Story } from 'inkjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import baseline from '../fixtures/saves/build-3b1.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureRuntime } from '../../src/narrative/fixtureSession.ts';
import {
  FixtureRuntime,
  isAutosaveBoundary,
} from '../../src/narrative/FixtureRuntime.ts';
import { NarrativeController } from '../../src/narrative/NarrativeController.ts';
import { createNarrativeQueryPort } from '../../src/narrative/NarrativeQueryPort.ts';
import { createFixtureDomainStore } from '../../src/state/fixtureDomainStore.ts';
import { SaveCoordinator } from '../../src/save/SaveCoordinator.ts';
import { createFixtureEventRegistry } from '../../src/narrative/EventRegistry.ts';
import {
  fixtureStorageKeys as keys,
  LocalStorageSaveRepository,
} from '../../src/save/LocalStorageSaveRepository.ts';
import { fixtureSaveVersions } from '../../src/save/types.ts';
import { validateSaveEnvelope } from '../../src/save/validateSave.ts';
import { TestStorage } from './helpers/TestStorage.ts';

function setup(storage = new TestStorage()) {
  const repository = new LocalStorageSaveRepository(() => storage);
  const runtime = createFixtureRuntime(repository);
  return { storage, repository, runtime };
}
function session(runtime: FixtureRuntime) {
  const current = runtime.getSnapshot().session;
  if (!current) throw new Error('No session');
  return current;
}
const view = (runtime: FixtureRuntime) =>
  session(runtime).controller.getSnapshot();
const next = (runtime: FixtureRuntime) => runtime.continue(view(runtime));
async function fresh() {
  const state = setup();
  await state.runtime.initialize();
  expect(await state.runtime.newRun()).toBe(true);
  return state;
}
function gate() {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release };
}
function saved(storage: TestStorage, slot = keys.slots.autosave) {
  return JSON.parse(storage.getItem(slot)!);
}

describe('real reviewed 3B-1 producer compatibility', () => {
  it('pins producer provenance and unchanged compiled fixture', () => {
    expect(baseline.producerCommit).toBe(
      'e0b6eefe3bd41ed6574bd13224868ea101b72547',
    );
    expect(
      createHash('sha256')
        .update(readFileSync('generated/narrative/technical_fixture.json'))
        .digest('hex'),
    ).toBe(baseline.compiledSha256);
    expect(baseline.saves).toHaveLength(20);
  });
  it.each(baseline.saves.map((save, i) => [i, save] as const))(
    'restores original checkpoint %s without relabeling or replay',
    async (_i, input) => {
      const storage = new TestStorage();
      storage.bytes.set(
        keys.profile,
        JSON.stringify({
          scope: 'technical-fixture-only',
          profileSchemaVersion: 1,
          profileId: input.profileId,
          readLineIds: [],
        }),
      );
      const raw = JSON.stringify(input);
      storage.bytes.set(keys.slots.autosave, raw);
      const { runtime } = setup(storage);
      const parsed = validateSaveEnvelope(
        input,
        fixtureSaveVersions,
        input.profileId,
        references,
        createFixtureEventRegistry(),
      );
      expect(parsed.appBuildVersion).toBe('0.0.0+m1-batch-3b-1');
      await runtime.initialize();
      expect(runtime.getSnapshot().phase).toBe('awaiting-decision');
      const advance = vi.spyOn(Story.prototype, 'Continue');
      const choose = vi.spyOn(Story.prototype, 'ChooseChoiceIndex');
      expect(await runtime.resume()).toBe(true);
      expect(advance).not.toHaveBeenCalled();
      expect(choose).not.toHaveBeenCalled();
      advance.mockRestore();
      choose.mockRestore();
      expect(view(runtime)).toMatchObject({
        phase: input.narrative.checkpoint.kind,
        line: input.narrative.checkpoint.line,
        choices: input.narrative.checkpoint.choices,
      });
      expect(session(runtime).store.getState()).toEqual(input.game);
      expect(session(runtime).notificationCount()).toBe(0);
      expect(storage.getItem(keys.slots.autosave)).toBe(raw);
      expect(storage.writes).toEqual([]);
      expect(await runtime.retrySave()).toBe(true);
      expect(saved(storage).appBuildVersion).toBe(
        fixtureSaveVersions.appBuildVersion,
      );
      runtime.dispose();
    },
  );
});

describe('runtime startup and command boundaries', () => {
  it('does not advance or write until explicit New Run, even with repeated initialize', async () => {
    const { runtime, storage } = setup();
    const advance = vi.spyOn(Story.prototype, 'Continue');
    const initialization = runtime.initialize();
    expect(runtime.initialize()).toBe(initialization);
    await initialization;
    expect(advance).not.toHaveBeenCalled();
    expect(runtime.getSnapshot()).toMatchObject({
      phase: 'awaiting-decision',
      session: null,
      busy: false,
    });
    expect(storage.writes).toEqual([]);
    await runtime.newRun();
    expect(advance).toHaveBeenCalled();
    advance.mockRestore();
    expect(view(runtime).line?.id).toBe('fixture_start_001');
    expect(
      storage.writes.filter((key) => key === keys.slots.autosave),
    ).toHaveLength(1);
    const count = storage.writes.length;
    await runtime.setEnvironment(true);
    await runtime.setEnvironment(false);
    const off = runtime.subscribe(() => {});
    off();
    await runtime.inspect();
    expect(storage.writes).toHaveLength(count);
    runtime.dispose();
  });
  it('creates no writes from disposed startup and a replacement startup', async () => {
    const { storage, repository, runtime } = setup();
    const waiting = gate();
    const load = repository.loadProfile.bind(repository);
    vi.spyOn(repository, 'loadProfile').mockImplementation(async () => {
      await waiting.pending;
      return load();
    });
    const pending = runtime.initialize();
    runtime.dispose();
    const replacement = setup(storage).runtime;
    await replacement.initialize();
    waiting.release();
    await pending;
    expect(runtime.getSnapshot().phase).toBe('disposed');
    expect(replacement.getSnapshot().phase).toBe('awaiting-decision');
    expect(storage.writes).toEqual([]);
    replacement.dispose();
  });
  it.each([0, 1])(
    'resumes branch %s, terminal line and choices without replay or stale input',
    async (branch) => {
      const { runtime, storage } = await fresh();
      await next(runtime);
      const choice = view(runtime);
      runtime.dispose();
      const restored = setup(storage).runtime;
      await restored.initialize();
      expect(storage.getItem(keys.slots.autosave)).toBeTruthy();
      const writes = storage.writes.length;
      await restored.resume();
      expect(storage.writes).toHaveLength(writes);
      expect(view(restored).phase).toBe('choice');
      expect(view(restored).sessionId).not.toBe(choice.sessionId);
      expect(await restored.choose(choice, branch)).toBe(false);
      expect(await restored.choose(view(restored), branch)).toBe(true);
      expect(session(restored).store.getState().effectCount).toBe(1);
      expect(session(restored).notificationCount()).toBe(0);
      await next(restored);
      await next(restored);
      expect(view(restored).line?.id).toBe('fixture_end_001');
      const old = view(restored);
      const reload = setup(storage).runtime;
      restored.dispose();
      await reload.initialize();
      await reload.resume();
      expect(view(reload).phase).toBe('line');
      expect(session(reload).store.getState().effectCount).toBe(2);
      expect(session(reload).notificationCount()).toBe(0);
      expect(await reload.continue(old)).toBe(false);
      await next(reload);
      expect(view(reload).phase).toBe('ended');
      reload.dispose();
    },
  );
  it('serializes rapid commands and rejects callback reentrancy before autosave', async () => {
    const { runtime, storage } = await fresh();
    const reentrant: Promise<boolean>[] = [];
    session(runtime).controller.subscribe((current) => {
      reentrant.push(runtime.continue(current));
    });
    const current = view(runtime);
    const first = runtime.continue(current);
    expect(await runtime.newRun()).toBe(false);
    expect(await runtime.manualSave('manual-1')).toBe(false);
    expect(await runtime.continue(current)).toBe(false);
    await first;
    expect(await Promise.all(reentrant)).toEqual([false]);
    expect(view(runtime).phase).toBe('choice');
    expect(
      storage.writes.filter((key) => key === keys.slots.autosave),
    ).toHaveLength(2);
    runtime.dispose();
  });
  it('retains pause and revision guards when the environment changes during publish', async () => {
    const { runtime } = await fresh();
    const unsubscribe = session(runtime).controller.subscribe((current) => {
      if (current.phase === 'choice') void runtime.setEnvironment(true);
    });
    await next(runtime);
    unsubscribe();
    const paused = view(runtime);
    expect(paused.paused).toBe(true);
    expect(await runtime.choose(paused, 0)).toBe(false);
    expect(await runtime.retrySave()).toBe(true); // Stable paused checkpoint.
    await runtime.setEnvironment(false);
    expect(await runtime.choose(paused, 0)).toBe(false);
    expect(await runtime.choose(view(runtime), 0)).toBe(true);
    runtime.dispose();
  });
  it('ordinary dialogue persists read history but does not autosave a game slot', async () => {
    const { Compiler } = createRequire(import.meta.url)(
      'inkjs/full',
    ) as typeof import('inkjs/full');
    const source = readFileSync(
      'narrative/fixtures/technical_fixture.ink',
      'utf8',
    ).replace(
      '# event:fixture.presentation.started',
      'Ordinary technical line # line:fixture_start_disabled_001\n# event:fixture.presentation.started',
    );
    const compiled = new Compiler(source).Compile().ToJson();
    const storage = new TestStorage();
    const repository = new LocalStorageSaveRepository(() => storage);
    const runtime = new FixtureRuntime({
      repository,
      references,
      createCoordinator: (profile) =>
        new SaveCoordinator({
          repository,
          profile,
          references,
          versions: fixtureSaveVersions,
          registry: createFixtureEventRegistry(),
          createSession: (seed) => {
            const store = createFixtureDomainStore(seed);
            const controller = new NarrativeController(
              compiled!,
              references,
              createFixtureEventRegistry(),
              createNarrativeQueryPort(store),
              { dispatch() {} },
              store,
            );
            controller.subscribe((current) => {
              if (current.phase === 'line' && current.line)
                profile.recordRead(current.line.id);
            });
            return { controller, store, notificationCount: () => 0 };
          },
        }),
    });
    await runtime.initialize();
    await runtime.newRun();
    const raw = storage.getItem(keys.slots.autosave);
    const before = view(runtime);
    await next(runtime);
    expect(isAutosaveBoundary(before, view(runtime), [], [])).toBe(false);
    expect(view(runtime).line?.id).toBe('fixture_start_disabled_001');
    expect(storage.getItem(keys.slots.autosave)).toBe(raw);
    expect(
      storage.writes.filter((key) => key === keys.slots.autosave),
    ).toHaveLength(1);
    expect(JSON.parse(storage.getItem(keys.profile)!).readLineIds).toContain(
      'fixture_start_disabled_001',
    );
    expect(runtime.getSnapshot().feedback.status).toBe('unsaved');
    runtime.dispose();
  });
});

describe('raw-bound intent, isolation and storage failures', () => {
  it('New Run cancel writes nothing, changed confirmation rejects, confirm isolates run/history', async () => {
    const { runtime, storage } = await fresh();
    await next(runtime);
    await runtime.choose(view(runtime), 0);
    const old = session(runtime).store.getState().runId;
    const count = storage.writes.length;
    await runtime.newRun();
    runtime.cancel();
    expect(storage.writes).toHaveLength(count);
    expect(session(runtime).store.getState().runId).toBe(old);
    await runtime.newRun();
    const original = storage.getItem(keys.slots.autosave)!;
    storage.bytes.set(keys.slots.autosave, original + ' ');
    expect(await runtime.confirm()).toBe(false);
    expect(session(runtime).store.getState().runId).toBe(old);
    expect(storage.writes).toHaveLength(count);
    await runtime.newRun();
    expect(await runtime.confirm()).toBe(true);
    expect(session(runtime).store.getState()).toMatchObject({
      effectCount: 0,
      committedEventIds: [],
    });
    expect(session(runtime).store.getState().runId).not.toBe(old);
    expect(session(runtime).controller.getBacklog()).toHaveLength(1);
    expect(runtime.getSnapshot().readLineIds).toContain('fixture_branch_a_001');
    runtime.dispose();
  });
  it('isolates manual slots, loads without writes, and requires different-run autosave consent', async () => {
    const { runtime, storage } = await fresh();
    await next(runtime);
    await runtime.manualSave('manual-1');
    const run = session(runtime).store.getState().runId;
    const one = storage.getItem(keys.slots['manual-1']);
    await runtime.newRun();
    await runtime.confirm();
    await runtime.manualSave('manual-2');
    const two = storage.getItem(keys.slots['manual-2']);
    await runtime.manualLoad('manual-1');
    expect(runtime.getSnapshot().confirmation?.kind).toBe('load');
    const count = storage.writes.length;
    await runtime.confirm();
    expect(storage.writes).toHaveLength(count);
    expect(view(runtime).phase).toBe('choice');
    expect(session(runtime).store.getState().runId).toBe(run);
    await runtime.choose(view(runtime), 1);
    expect(saved(storage).game.runId).toBe(run);
    expect(storage.getItem(keys.slots['manual-1'])).toBe(one);
    expect(storage.getItem(keys.slots['manual-2'])).toBe(two);
    await runtime.manualSave('manual-1');
    expect(runtime.getSnapshot().confirmation?.kind).toBe('save');
    runtime.cancel();
    expect(storage.getItem(keys.slots['manual-1'])).toBe(one);
    runtime.dispose();
  });
  it('rejects a slot changed after selection before candidate activation', async () => {
    const { runtime, storage } = await fresh();
    await runtime.manualSave('manual-1');
    const before = session(runtime);
    storage.bytes.set(
      keys.slots['manual-1'],
      storage.getItem(keys.slots['manual-1'])! + ' ',
    );
    expect(await runtime.manualLoad('manual-1')).toBe(false);
    expect(session(runtime)).toBe(before);
    expect(runtime.getSnapshot().feedback.message).toContain(
      'changed before load',
    );
    runtime.dispose();
  });
  it('rejects an empty manual target that becomes occupied before save, even by the same run', async () => {
    const { runtime, storage, repository } = await fresh();
    const original = storage.getItem(keys.slots.autosave)!;
    const load = repository.load.bind(repository);
    vi.spyOn(repository, 'load').mockImplementation(async (slot) => {
      const record = await load(slot);
      if (slot === 'manual-1' && record.kind === 'empty')
        storage.bytes.set(keys.slots['manual-1'], original);
      return record;
    });
    expect(await runtime.manualSave('manual-1')).toBe(false);
    expect(storage.getItem(keys.slots['manual-1'])).toBe(original);
    expect(storage.writes).not.toContain(keys.slots['manual-1']);
    runtime.dispose();
  });
  it('keeps live gameplay but blocks physical writes if profile becomes protected', async () => {
    const { runtime, storage } = await fresh();
    const raw = storage.getItem(keys.slots.autosave);
    storage.bytes.set(keys.profile, '{protected');
    expect(await next(runtime)).toBe(false);
    expect(view(runtime).phase).toBe('choice');
    expect(runtime.getSnapshot().feedback.status).toBe('error');
    expect(storage.getItem(keys.profile)).toBe('{protected');
    expect(storage.getItem(keys.slots.autosave)).toBe(raw);
    expect(await runtime.retrySave()).toBe(false);
    runtime.dispose();
  });
  it.each(['missing', 'corrupt', 'future'] as const)(
    'blocks %s profile with existing saves without writes',
    async (kind) => {
      const { runtime, storage } = await fresh();
      runtime.dispose();
      if (kind === 'missing') storage.bytes.delete(keys.profile);
      if (kind === 'corrupt') storage.bytes.set(keys.profile, '{bad');
      if (kind === 'future') {
        const profile = JSON.parse(storage.getItem(keys.profile)!);
        profile.profileSchemaVersion = 99;
        storage.bytes.set(keys.profile, JSON.stringify(profile));
      }
      const bytes = [...storage.bytes];
      const count = storage.writes.length;
      const nextRuntime = setup(storage).runtime;
      await nextRuntime.initialize();
      expect(nextRuntime.getSnapshot().phase).toBe('blocked');
      expect(await nextRuntime.newRun()).toBe(false);
      expect([...storage.bytes]).toEqual(bytes);
      expect(storage.writes).toHaveLength(count);
      nextRuntime.dispose();
    },
  );
  it.each([
    'corrupt',
    'future-schema',
    'unknown-build',
    'story',
    'foreign',
  ] as const)('preserves protected %s autosave', async (kind) => {
    const { runtime, storage } = await fresh();
    runtime.dispose();
    const input = saved(storage);
    if (kind === 'future-schema') input.saveSchemaVersion = 99;
    if (kind === 'unknown-build') input.appBuildVersion = 'future-build';
    if (kind === 'story') input.storyCompatibilityVersion = 'another-story';
    if (kind === 'foreign') input.profileId = 'someone-else';
    const raw = kind === 'corrupt' ? '{bad' : JSON.stringify(input);
    storage.bytes.set(keys.slots.autosave, raw);
    const count = storage.writes.length;
    const nextRuntime = setup(storage).runtime;
    await nextRuntime.initialize();
    expect(nextRuntime.getSnapshot().phase).toBe('blocked');
    expect(await nextRuntime.resume()).toBe(false);
    expect(storage.getItem(keys.slots.autosave)).toBe(raw);
    expect(storage.writes).toHaveLength(count);
    nextRuntime.dispose();
  });
  it('does not silently resume a manual slot when autosave is empty', async () => {
    const { runtime, storage } = await fresh();
    await runtime.manualSave('manual-1');
    runtime.dispose();
    storage.bytes.delete(keys.slots.autosave);
    const reload = setup(storage).runtime;
    await reload.initialize();
    expect(reload.getSnapshot()).toMatchObject({
      phase: 'awaiting-decision',
      session: null,
    });
    expect(await reload.resume()).toBe(false);
    expect(await reload.manualLoad('manual-1')).toBe(true);
    reload.dispose();
  });
  it('reports storage denied without interpreting it as empty', async () => {
    const runtime = createFixtureRuntime(
      new LocalStorageSaveRepository(() => {
        throw new DOMException('Denied', 'SecurityError');
      }),
    );
    await runtime.initialize();
    expect(runtime.getSnapshot().phase).toBe('blocked');
    expect(runtime.getSnapshot().feedback.message).toBe('Denied');
    runtime.dispose();
  });
  it('keeps a coherent live run on quota failure, preserves bytes, and retries explicitly', async () => {
    const { runtime, storage } = await fresh();
    const raw = storage.getItem(keys.slots.autosave);
    storage.beforeSet = (key) => {
      if (key === keys.slots.autosave)
        throw new DOMException('Quota', 'QuotaExceededError');
    };
    expect(await next(runtime)).toBe(false);
    expect(view(runtime).phase).toBe('choice');
    expect(runtime.getSnapshot()).toMatchObject({
      phase: 'active',
      busy: false,
      feedback: { status: 'error' },
    });
    expect(storage.getItem(keys.slots.autosave)).toBe(raw);
    storage.beforeSet = null;
    expect(await runtime.retrySave()).toBe(true);
    expect(saved(storage).narrative.checkpoint.kind).toBe('choice');
    runtime.dispose();
  });
  it('revokes a runtime pending physical write on disposal; old completion cannot publish', async () => {
    const storage = new TestStorage();
    const repository = new LocalStorageSaveRepository(() => storage);
    const first = createFixtureRuntime(repository);
    await first.initialize();
    await first.newRun();
    const waiting = gate();
    const save = repository.save.bind(repository);
    let entered = false;
    vi.spyOn(repository, 'save').mockImplementation(async (...args) => {
      entered = true;
      await waiting.pending;
      await save(...args);
    });
    const pending = next(first);
    const listener = vi.fn();
    first.subscribe(listener);
    await vi.waitFor(() => expect(entered).toBe(true));
    first.dispose();
    const replacement = setup(storage).runtime;
    await replacement.initialize();
    await replacement.newRun();
    await replacement.confirm();
    const bytes = storage.getItem(keys.slots.autosave);
    listener.mockClear();
    waiting.release();
    await pending;
    expect(listener).not.toHaveBeenCalled();
    expect(first.getSnapshot().phase).toBe('disposed');
    expect(storage.getItem(keys.slots.autosave)).toBe(bytes);
    expect(replacement.getSnapshot().busy).toBe(false);
    replacement.dispose();
  });
});
