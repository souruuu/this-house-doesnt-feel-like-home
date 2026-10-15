import { describe, expect, it, vi } from 'vitest';
import { Story } from 'inkjs';
import compiled from '../../generated/narrative/technical_fixture.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from '../../src/narrative/EventRegistry.ts';
import { NarrativeController } from '../../src/narrative/NarrativeController.ts';
import { createNarrativeQueryPort } from '../../src/narrative/NarrativeQueryPort.ts';
import {
  createFixtureSession,
  type FixtureSession,
} from '../../src/narrative/fixtureSession.ts';
import { SaveCoordinator } from '../../src/save/SaveCoordinator.ts';
import {
  fixtureSaveVersions,
  type FixtureSaveEnvelope,
} from '../../src/save/types.ts';
import { validateSaveEnvelope } from '../../src/save/validateSave.ts';
import {
  createFixtureDomainStore,
  initialFixtureState,
} from '../../src/state/fixtureDomainStore.ts';
import { createFixtureProfileStore } from '../../src/state/fixtureProfileStore.ts';
import { MemorySaveRepository } from './helpers/MemorySaveRepository.ts';

const registry = createFixtureEventRegistry();
function makeOwner() {
  const repository = new MemorySaveRepository();
  const profile = createFixtureProfileStore();
  const candidates: FixtureSession[] = [];
  const createSession = vi.fn(
    (seed?: ReturnType<typeof initialFixtureState>) => {
      const session = createFixtureSession(seed, profile);
      candidates.push(session);
      return session;
    },
  );
  const coordinator = new SaveCoordinator({
    repository,
    profile,
    createSession,
    versions: fixtureSaveVersions,
    references,
    registry,
  });
  const active = () => coordinator.getSnapshot().session;
  active().controller.start();
  return {
    coordinator,
    repository,
    profile,
    active,
    createSession,
    candidates,
  };
}

function next(session: FixtureSession) {
  expect(session.controller.continue(session.controller.getSnapshot())).toBe(
    true,
  );
}
function branch(session: FixtureSession, index: number) {
  next(session);
  expect(session.controller.getSnapshot().phase).toBe('choice');
  expect(
    session.controller.choose(session.controller.getSnapshot(), index),
  ).toBe(true);
}
function validate(input: unknown, profileId: string) {
  return validateSaveEnvelope(
    input,
    fixtureSaveVersions,
    profileId,
    references,
    registry,
  );
}

describe('real Ink coherent checkpoint round trips', () => {
  it.each([0, 1])(
    'restores every readable line including terminal line on branch %s',
    async (index) => {
      const { coordinator, active } = makeOwner();
      for (let step = 0; step < 4; step++) {
        if (step === 1) branch(active(), index);
        if (step > 1) next(active());
        const original = active();
        const view = original.controller.getSnapshot();
        const backlog = original.controller.getBacklog();
        const domain = original.store.getState();
        await coordinator.save('manual-1');
        const advance = vi.spyOn(Story.prototype, 'Continue');
        const choose = vi.spyOn(Story.prototype, 'ChooseChoiceIndex');
        const receipt = await coordinator.load('manual-1');
        expect(advance).not.toHaveBeenCalled();
        expect(choose).not.toHaveBeenCalled();
        advance.mockRestore();
        choose.mockRestore();
        expect(receipt.notificationError).toBeNull();
        const restored = active();
        expect(Object.isFrozen(restored)).toBe(true);
        expect(restored).not.toBe(original);
        expect(restored.controller.getSnapshot()).toMatchObject({
          phase: 'line',
          line: view.line,
          choices: [],
          presentation: view.presentation,
        });
        expect(restored.controller.getSnapshot().sessionId).not.toBe(
          view.sessionId,
        );
        expect(restored.store.getState()).toEqual(domain);
        expect(restored.controller.getBacklog()).toEqual(backlog);
        expect(restored.notificationCount()).toBe(0);
        expect(original.controller.getSnapshot().phase).toBe('disposed');
        expect(restored.controller.continue(view)).toBe(false);
      }
      expect(active().controller.getSnapshot().line?.id).toBe(
        'fixture_end_001',
      );
      expect(active().controller.getSnapshot().phase).toBe('line');
      expect(active().store.getState().effectCount).toBe(2);
      next(active());
      expect(active().controller.getSnapshot().phase).toBe('ended');
      expect(active().notificationCount()).toBe(0);
      expect(active().store.getState().effectCount).toBe(2);
      coordinator.dispose();
    },
  );

  it.each([0, 1])(
    'restores an unselected choice, then selects branch %s once',
    async (index) => {
      const { coordinator, active } = makeOwner();
      next(active());
      const old = active().controller.getSnapshot();
      const save = await coordinator.save('manual-2');
      expect(save.narrative.cursorPath).toBeNull();
      await coordinator.load('manual-2');
      expect(active().controller.getSnapshot()).toMatchObject({
        phase: 'choice',
        choices: old.choices,
        line: old.line,
      });
      expect(active().store.getState().effectCount).toBe(0);
      expect(active().notificationCount()).toBe(0);
      expect(active().controller.choose(old, index)).toBe(false);
      const request = active().controller.getSnapshot();
      expect(active().controller.choose(request, index)).toBe(true);
      expect(active().controller.choose(request, index)).toBe(false);
      next(active());
      expect(active().controller.getSnapshot().line?.text).toContain(
        'ยืนยันข้อมูลหลังบันทึก',
      );
      expect(active().store.getState().effectCount).toBe(1);
      expect(active().notificationCount()).toBe(1);
      coordinator.dispose();
    },
  );

  it('preserves paused safe checkpoints and a fresh revision/session guard', async () => {
    const { coordinator, active } = makeOwner();
    const initial = active().controller.getSnapshot();
    active().controller.setPaused(true);
    expect((await coordinator.save('manual-1')).narrative.checkpoint.kind).toBe(
      'line',
    );
    await coordinator.load('manual-1');
    expect(active().controller.getSnapshot().paused).toBe(true);
    expect(active().controller.continue(initial)).toBe(false);
    active().controller.setPaused(false);
    const stale = active().controller.getSnapshot();
    active().controller.setPaused(true);
    active().controller.setPaused(false);
    expect(active().controller.continue(stale)).toBe(false);
    next(active());
    active().controller.setPaused(true);
    expect((await coordinator.save('manual-1')).narrative.checkpoint.kind).toBe(
      'choice',
    );
    coordinator.dispose();
  });

  it('detaches frozen captures from future state and never rewinds profile history', async () => {
    const { coordinator, active, profile } = makeOwner();
    const save = await coordinator.save('manual-1');
    expect(Object.isFrozen(save.game.flags)).toBe(true);
    expect(Object.isFrozen(save.narrative.backlog[0])).toBe(true);
    branch(active(), 0);
    const history = profile.getState();
    await coordinator.load('manual-1');
    expect(active().store.getState().effectCount).toBe(0);
    expect(active().controller.getBacklog()).toEqual(save.narrative.backlog);
    expect(profile.getState()).toBe(history);
    expect(profile.getState().readLineIds).toContain('fixture_branch_a_001');
    expect(Object.keys(save)).not.toContain('settings');
    expect(Object.keys(save)).not.toContain('readLineIds');
    coordinator.dispose();
  });
});

describe('capture and operation safety boundaries', () => {
  it('rejects capture in presentation callbacks and in an error state', () => {
    const store = createFixtureDomainStore();
    let attempts = 0;
    const controller = new NarrativeController(
      JSON.stringify(compiled),
      references,
      registry,
      createNarrativeQueryPort(store),
      {
        dispatch: () => {
          attempts++;
          expect(() =>
            controller.captureCheckpoint(() => store.capture()),
          ).toThrow('busy');
        },
      },
      store,
    );
    controller.start();
    expect(controller.continue(controller.getSnapshot())).toBe(true);
    expect(attempts).toBe(1);
    controller.subscribe(() => {
      throw new Error('publish failure');
    });
    expect(controller.choose(controller.getSnapshot(), 0)).toBe(false);
    expect(controller.getSnapshot().phase).toBe('error');
    expect(() => controller.captureCheckpoint(() => store.capture())).toThrow(
      'safe',
    );
    controller.dispose();
  });

  it('rejects save/new-run reentrancy from both domain and controller notifications', async () => {
    const { coordinator, active } = makeOwner();
    const rejected: Promise<unknown>[] = [];
    const rejectOperations = () => {
      rejected.push(expect(coordinator.save('manual-1')).rejects.toThrow());
      rejected.push(expect(coordinator.newRun()).rejects.toThrow());
    };
    active().store.subscribe(rejectOperations);
    active().controller.subscribe(rejectOperations);
    branch(active(), 0);
    await Promise.all(rejected);
    expect(active().store.getState().effectCount).toBe(1);
    expect(active().controller.getSnapshot().phase).toBe('line');
    coordinator.dispose();
  });

  it('rejects a direct store subscriber capture outside a narrative advance', () => {
    const session = createFixtureSession();
    session.controller.start();
    const event = registry.resolve('fixture.domain.branch_a');
    if (event.category !== 'domain') throw new Error('Expected domain event');
    session.store.subscribe(() => {
      expect(() =>
        session.controller.captureCheckpoint(() => session.store.capture()),
      ).toThrow('locked');
    });
    session.store.commit([event]);
    session.controller.dispose();
  });

  it('rejects capture during domain notifications and controller publish, including pause publish', async () => {
    const { coordinator, active } = makeOwner();
    const session = active();
    let domainAttempt = 0;
    let publishAttempt = 0;
    session.store.subscribe(() => {
      domainAttempt++;
      expect(() =>
        session.controller.captureCheckpoint(() => session.store.capture()),
      ).toThrow();
      expect(() => session.store.capture()).toThrow('locked');
    });
    session.controller.subscribe(() => {
      publishAttempt++;
      expect(() =>
        session.controller.captureCheckpoint(() => session.store.capture()),
      ).toThrow();
      expect(
        session.controller.continue(session.controller.getSnapshot()),
      ).toBe(false);
    });
    branch(session, 0);
    session.controller.setPaused(true);
    expect(domainAttempt).toBe(1);
    expect(publishAttempt).toBe(3);
    expect(await coordinator.save('manual-1')).toBeDefined();
    coordinator.dispose();
  });

  it('rejects idle, ended, disposed and released-lease captures', () => {
    const session = createFixtureSession();
    const capture = () =>
      session.controller.captureCheckpoint(() => session.store.capture());
    expect(capture).toThrow('safe');
    session.controller.start();
    const lease = session.controller.holdForSessionOperation();
    expect(capture).toThrow('busy');
    expect(
      lease.capture(() => session.store.capture()).narrative.checkpoint.kind,
    ).toBe('line');
    lease.release();
    expect(() => lease.capture(() => session.store.capture())).toThrow(
      'released',
    );
    branch(session, 0);
    next(session);
    next(session);
    next(session);
    expect(capture).toThrow('safe');
    session.controller.dispose();
    expect(capture).toThrow('disposed');
  });

  it('blocks overlapping operations and narrative input across a repository await', async () => {
    const { coordinator, repository, active } = makeOwner();
    let release!: () => void;
    repository.beforeSave = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const pending = coordinator.save('manual-1');
    expect(
      active().controller.continue(active().controller.getSnapshot()),
    ).toBe(false);
    await expect(coordinator.save('manual-2')).rejects.toThrow('busy');
    await expect(coordinator.load('manual-1')).rejects.toThrow('busy');
    await expect(coordinator.newRun()).rejects.toThrow('busy');
    release();
    await pending;
    next(active());
    coordinator.dispose();
  });

  it('rejects stale load completion after disposal before preparing a candidate', async () => {
    const { coordinator, repository, active, createSession } = makeOwner();
    await coordinator.save('manual-1');
    let release!: () => void;
    repository.beforeLoad = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const pending = coordinator.load('manual-1');
    const original = active();
    coordinator.dispose();
    release();
    await expect(pending).rejects.toThrow('Stale');
    expect(active()).toBe(original);
    expect(createSession).toHaveBeenCalledTimes(1);
  });
});

describe('candidate failure and activation receipts', () => {
  it.each(['line-before-choice', 'unselected-choice', 'rejoin-after-commit'])(
    'rejects individually valid but incoherent domain/cursor components: %s',
    async (boundary) => {
      const { coordinator, active, repository } = makeOwner();
      const initial = await coordinator.save('manual-1');
      next(active());
      const choice = await coordinator.save('manual-1');
      active().controller.choose(active().controller.getSnapshot(), 0);
      const committed = await coordinator.save('manual-1');
      next(active());
      const rejoin = await coordinator.save('manual-1');
      const mismatched =
        boundary === 'rejoin-after-commit'
          ? { ...rejoin, game: initial.game }
          : {
              ...(boundary === 'unselected-choice' ? choice : initial),
              game: committed.game,
            };
      repository.slots.set('manual-1', mismatched);
      const before = active();
      await expect(coordinator.load('manual-1')).rejects.toThrow();
      expect(active()).toBe(before);
      coordinator.dispose();
    },
  );

  it('reports a controller pause notification failure after activation without rollback', async () => {
    const { coordinator, active, createSession, profile } = makeOwner();
    active().controller.setPaused(true);
    await coordinator.save('manual-1');
    const old = active();
    createSession.mockImplementationOnce((seed) => {
      const candidate = createFixtureSession(seed, profile);
      candidate.controller.subscribe(() => {
        throw new Error('pause subscriber failed');
      });
      return candidate;
    });
    expect(await coordinator.load('manual-1')).toEqual({
      notificationError: 'pause subscriber failed',
    });
    expect(active()).not.toBe(old);
    expect(active().controller.getSnapshot()).toMatchObject({
      phase: 'line',
      paused: true,
    });
    expect(old.controller.getSnapshot().phase).toBe('disposed');
    expect(active().notificationCount()).toBe(0);
    coordinator.dispose();
  });

  it('restores a false authoritative query input and binds subsequent reads to the candidate', async () => {
    const { coordinator, active, createSession, profile } = makeOwner();
    createSession.mockImplementationOnce(() =>
      createFixtureSession(initialFixtureState(false), profile),
    );
    await coordinator.newRun();
    active().controller.start();
    expect(active().controller.getSnapshot().line?.id).toBe(
      'fixture_start_disabled_001',
    );
    await coordinator.save('manual-1');
    await coordinator.newRun();
    active().controller.start();
    expect(active().store.getState().flags['fixture.branch_enabled']).toBe(
      true,
    );
    await coordinator.load('manual-1');
    expect(active().controller.getSnapshot().line?.id).toBe(
      'fixture_start_disabled_001',
    );
    expect(active().store.getState().flags['fixture.branch_enabled']).toBe(
      false,
    );
    branch(active(), 1);
    next(active());
    expect(active().controller.getSnapshot().line?.text).toContain(
      'ยืนยันข้อมูลหลังบันทึก',
    );
    coordinator.dispose();
  });

  it('refuses a save from another actual profile without changing either history', async () => {
    const first = makeOwner();
    const second = makeOwner();
    branch(first.active(), 0);
    const save = await first.coordinator.save('manual-1');
    second.repository.slots.set('manual-1', save);
    const old = second.active();
    const history = second.profile.getState();
    await expect(second.coordinator.load('manual-1')).rejects.toThrow(
      'different profile',
    );
    expect(second.active()).toBe(old);
    expect(second.profile.getState()).toBe(history);
    expect(first.profile.getState().readLineIds).toContain(
      'fixture_branch_a_001',
    );
    expect(history.readLineIds).not.toContain('fixture_branch_a_001');
    first.coordinator.dispose();
    second.coordinator.dispose();
  });

  it('rejects an unknown or out-of-range Ink cursor through exact public path lookup', async () => {
    const { coordinator, repository, active } = makeOwner();
    const save = await coordinator.save('manual-1');
    const ink = JSON.parse(save.narrative.inkStateJson);
    // Tamper serialized data only; no runtime private API is called.
    ink.flows.DEFAULT_FLOW.callstack.threads[0].callstack[0].idx = 999999;
    const invalidPath = save.narrative.cursorPath?.replace(
      /\.[0-9]+$/,
      '.999999',
    );
    repository.slots.set('manual-1', {
      ...save,
      narrative: {
        ...save.narrative,
        inkStateJson: JSON.stringify(ink),
        cursorPath: invalidPath,
      },
    });
    const before = active();
    await expect(coordinator.load('manual-1')).rejects.toThrow(
      'Invalid Ink cursor',
    );
    expect(active()).toBe(before);
    coordinator.dispose();
  });

  it('rejects Ink path approximation instead of using its repaired cursor', async () => {
    const { coordinator, repository, active } = makeOwner();
    const save = await coordinator.save('manual-1');
    const ink = JSON.parse(save.narrative.inkStateJson);
    ink.flows.DEFAULT_FLOW.callstack.threads[0].callstack[0].cPath =
      'missing.container';
    repository.slots.set('manual-1', {
      ...save,
      narrative: { ...save.narrative, inkStateJson: JSON.stringify(ink) },
    });
    const before = active();
    await expect(coordinator.load('manual-1')).rejects.toThrow();
    expect(active()).toBe(before);
    coordinator.dispose();
  });

  it('rejects a cursor/semantic line mismatch without advancing the candidate', async () => {
    const { coordinator, repository, active } = makeOwner();
    const first = await coordinator.save('manual-1');
    branch(active(), 0);
    next(active());
    const later = await coordinator.save('manual-2');
    repository.slots.set('manual-1', {
      ...later,
      game: first.game,
      narrative: {
        ...later.narrative,
        checkpoint: first.narrative.checkpoint,
        backlog: first.narrative.backlog,
      },
    });
    const before = active();
    await expect(coordinator.load('manual-1')).rejects.toThrow(
      'semantic checkpoint mismatch',
    );
    expect(active()).toBe(before);
    coordinator.dispose();
  });

  it('rejects a branch-line checkpoint with its durable event missing', async () => {
    const { coordinator, repository, active } = makeOwner();
    const first = await coordinator.save('manual-1');
    branch(active(), 0);
    const later = await coordinator.save('manual-2');
    const candidate = createFixtureSession(first.game);
    expect(() =>
      candidate.controller.restoreCheckpoint(later.narrative, []),
    ).toThrow('missing its committed');
    candidate.controller.dispose();
    repository.slots.set('manual-1', { ...later, game: first.game });
    const before = active();
    await expect(coordinator.load('manual-1')).rejects.toThrow(
      'progress/ledger mismatch',
    );
    expect(active()).toBe(before);
    coordinator.dispose();
  });

  it.each(['id', 'text', 'index'] as const)(
    'rejects a changed restored choice %s',
    async (field) => {
      const { coordinator, repository, active } = makeOwner();
      next(active());
      const save = await coordinator.save('manual-1');
      const choices = save.narrative.checkpoint.choices.map((choice, index) =>
        index
          ? choice
          : {
              ...choice,
              [field]:
                field === 'index'
                  ? 3
                  : field === 'id'
                    ? 'fixture_branch_a_001'
                    : 'changed text',
            },
      );
      repository.slots.set('manual-1', {
        ...save,
        narrative: {
          ...save.narrative,
          checkpoint: { ...save.narrative.checkpoint, choices },
        },
      });
      const before = active();
      await expect(coordinator.load('manual-1')).rejects.toThrow();
      expect(active()).toBe(before);
      coordinator.dispose();
    },
  );

  it('preserves the old session if the candidate factory throws', async () => {
    const { coordinator, active, createSession } = makeOwner();
    await coordinator.save('manual-1');
    const before = active();
    createSession.mockImplementationOnce(() => {
      throw new Error('candidate failure');
    });
    await expect(coordinator.load('manual-1')).rejects.toThrow(
      'candidate failure',
    );
    expect(active()).toBe(before);
    next(active());
    coordinator.dispose();
  });

  it('rejects reentrant operations during activation and notifies every subscriber', async () => {
    const { coordinator, active } = makeOwner();
    await coordinator.save('manual-1');
    const rejected: Promise<unknown>[] = [];
    coordinator.subscribe(() => {
      expect(
        active().controller.continue(active().controller.getSnapshot()),
      ).toBe(false);
      rejected.push(
        expect(coordinator.save('manual-1')).rejects.toThrow('busy'),
      );
      rejected.push(
        expect(coordinator.load('manual-1')).rejects.toThrow('busy'),
      );
      rejected.push(expect(coordinator.newRun()).rejects.toThrow('busy'));
    });
    await coordinator.load('manual-1');
    await Promise.all(rejected);
    next(active());
    coordinator.dispose();
  });

  it('does not permit restoring over an existing active cursor', async () => {
    const { coordinator, active } = makeOwner();
    const save = await coordinator.save('manual-1');
    expect(() =>
      active().controller.restoreCheckpoint(
        save.narrative,
        save.game.committedEventIds,
      ),
    ).toThrow('fresh candidate');
    next(active());
    coordinator.dispose();
  });

  it('preserves live session and stored bytes when candidate LoadJson fails', async () => {
    const { coordinator, repository, active, candidates } = makeOwner();
    const save = await coordinator.save('manual-1');
    const before = active();
    repository.slots.set('manual-1', {
      ...save,
      narrative: { ...save.narrative, inkStateJson: '{}' },
    });
    const bytes = JSON.stringify(repository.slots.get('manual-1'));
    await expect(coordinator.load('manual-1')).rejects.toThrow();
    expect(active()).toBe(before);
    expect(before.controller.getSnapshot().phase).toBe('line');
    expect(candidates.at(-1)?.controller.getSnapshot().phase).toBe('disposed');
    expect(JSON.stringify(repository.slots.get('manual-1'))).toBe(bytes);
    next(active());
    coordinator.dispose();
  });

  it('keeps the coherent activated session when a subscriber throws', async () => {
    const { coordinator, active } = makeOwner();
    branch(active(), 1);
    const save = await coordinator.save('manual-1');
    const old = active();
    const observed: unknown[] = [];
    coordinator.subscribe(() => {
      const session = active();
      observed.push({
        game: session.store.getState(),
        view: session.controller.getSnapshot().line,
      });
      expect(() =>
        session.controller.captureCheckpoint(() => session.store.capture()),
      ).toThrow('busy');
      throw new Error('activation subscriber failed');
    });
    const last = vi.fn();
    coordinator.subscribe(last);
    expect(await coordinator.load('manual-1')).toEqual({
      notificationError: 'activation subscriber failed',
    });
    expect(last).toHaveBeenCalledTimes(1);
    expect(observed).toEqual([
      { game: save.game, view: save.narrative.checkpoint.line },
    ]);
    expect(active()).not.toBe(old);
    expect(old.controller.getSnapshot().phase).toBe('disposed');
    expect(active().store.getState().effectCount).toBe(1);
    next(active());
    expect(active().store.getState().effectCount).toBe(1);
    coordinator.dispose();
  });

  it('reports repository failures, preserves live state and unlocks the next operation', async () => {
    const { coordinator, repository, active } = makeOwner();
    const before = active();
    repository.beforeSave = async () => {
      throw new Error('write failure');
    };
    await expect(coordinator.save('manual-1')).rejects.toThrow('write failure');
    expect(repository.slots.has('manual-1')).toBe(false);
    repository.beforeSave = null;
    await coordinator.save('manual-1');
    repository.beforeLoad = async () => {
      throw new Error('read failure');
    };
    await expect(coordinator.load('manual-1')).rejects.toThrow('read failure');
    expect(active()).toBe(before);
    next(active());
    coordinator.dispose();
  });
});

describe('strict fixture envelope validation', () => {
  const mutations: [string, (save: FixtureSaveEnvelope) => unknown][] = [
    ['future schema', (s) => ({ ...s, saveSchemaVersion: 2 })],
    ['older unsupported schema', (s) => ({ ...s, saveSchemaVersion: 0 })],
    ['different build', (s) => ({ ...s, appBuildVersion: 'other' })],
    [
      'incompatible story',
      (s) => ({ ...s, storyCompatibilityVersion: 'other' }),
    ],
    ['release scope', (s) => ({ ...s, scope: 'release' })],
    ['profile mismatch', (s) => ({ ...s, profileId: 'other' })],
    ['invalid timestamp', (s) => ({ ...s, timestamp: NaN })],
    ['unknown field', (s) => ({ ...s, settings: {} })],
    ['invalid run', (s) => ({ ...s, game: { ...s.game, runId: '' } })],
    [
      'unknown flag',
      (s) => ({
        ...s,
        game: {
          ...s.game,
          flags: { ...s.game.flags, 'fixture.unknown': true },
        },
      }),
    ],
    ['missing flag', (s) => ({ ...s, game: { ...s.game, flags: {} } })],
    [
      'unknown event',
      (s) => ({ ...s, game: { ...s.game, committedEventIds: ['unknown'] } }),
    ],
    [
      'presentation ledger',
      (s) => ({
        ...s,
        game: {
          ...s.game,
          committedEventIds: ['fixture.presentation.started'],
        },
      }),
    ],
    [
      'duplicate ledger',
      (s) => ({
        ...s,
        game: {
          ...s.game,
          committedEventIds: [
            'fixture.domain.branch_a',
            'fixture.domain.branch_a',
          ],
        },
      }),
    ],
    [
      'invalid event order',
      (s) => ({
        ...s,
        game: { ...s.game, committedEventIds: ['fixture.domain.rejoined'] },
      }),
    ],
    [
      'effect count mismatch',
      (s) => ({ ...s, game: { ...s.game, effectCount: 1 } }),
    ],
    [
      'branch mismatch',
      (s) => ({ ...s, game: { ...s.game, selectedBranch: 'a' } }),
    ],
    [
      'corrupt Ink',
      (s) => ({ ...s, narrative: { ...s.narrative, inkStateJson: '{' } }),
    ],
    [
      'unknown scene',
      (s) => ({
        ...s,
        narrative: {
          ...s.narrative,
          checkpoint: {
            ...s.narrative.checkpoint,
            presentation: {
              ...s.narrative.checkpoint.presentation,
              sceneId: 'unknown',
            },
          },
        },
      }),
    ],
    [
      'unknown line',
      (s) => ({
        ...s,
        narrative: {
          ...s.narrative,
          checkpoint: {
            ...s.narrative.checkpoint,
            line: { ...s.narrative.checkpoint.line, id: 'unknown' },
          },
        },
      }),
    ],
    [
      'corrupt backlog',
      (s) => ({ ...s, narrative: { ...s.narrative, backlog: [] } }),
    ],
  ];
  it.each(mutations)(
    'rejects %s without changing the live session or stored data',
    async (_label, mutate) => {
      const { coordinator, repository, active, profile } = makeOwner();
      const save = await coordinator.save('manual-1');
      const input = mutate(save);
      expect(() => validate(input, profile.getState().profileId)).toThrow();
      repository.slots.set('manual-1', input);
      const before = active();
      await expect(coordinator.load('manual-1')).rejects.toThrow();
      expect(active()).toBe(before);
      expect(repository.slots.get('manual-1')).toBe(input);
      coordinator.dispose();
    },
  );

  it('isolates new runs, profile histories and all four repository slot tokens', async () => {
    const { coordinator, active, profile } = makeOwner();
    const first = active();
    await coordinator.save('autosave');
    branch(active(), 0);
    await coordinator.save('manual-1');
    const read = profile.getState();
    await coordinator.newRun();
    expect(active().store.getState().runId).not.toBe(
      first.store.getState().runId,
    );
    expect(active().store.getState().committedEventIds).toEqual([]);
    expect(active().controller.getBacklog()).toEqual([]);
    expect(profile.getState()).toBe(read);
    active().controller.start();
    branch(active(), 1);
    await coordinator.save('manual-2');
    next(active());
    next(active());
    await coordinator.save('manual-3');
    await coordinator.load('manual-1');
    expect(active().store.getState().selectedBranch).toBe('a');
    expect(
      active()
        .controller.getBacklog()
        .map((e) => e.lineId),
    ).toEqual(['fixture_start_001', 'fixture_branch_a_001']);
    await coordinator.load('manual-2');
    expect(active().store.getState().selectedBranch).toBe('b');
    expect(
      active()
        .controller.getBacklog()
        .map((e) => e.lineId),
    ).not.toContain('fixture_branch_a_001');
    await coordinator.load('manual-3');
    expect(active().store.getState().effectCount).toBe(2);
    await coordinator.load('autosave');
    expect(active().store.getState().effectCount).toBe(0);
    expect(active().store.getState().runId).toBe(first.store.getState().runId);
    expect(createFixtureProfileStore().getState().readLineIds).toEqual([]);
    coordinator.dispose();
  });
});
