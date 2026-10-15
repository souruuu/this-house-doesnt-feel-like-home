import { describe, expect, it, vi } from 'vitest';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from '../../src/narrative/EventRegistry.ts';
import { createFixtureSession } from '../../src/narrative/fixtureSession.ts';
import {
  SaveCoordinator,
  SaveWriteFailure,
} from '../../src/save/SaveCoordinator.ts';
import {
  fixtureSaveVersions,
  type FixtureSaveEnvelope,
} from '../../src/save/types.ts';
import { createFixtureProfileStore } from '../../src/state/fixtureProfileStore.ts';
import { MemorySaveRepository } from './helpers/MemorySaveRepository.ts';
import { TestStorage } from './helpers/TestStorage.ts';
import {
  fixtureStorageKeys as keys,
  LocalStorageSaveRepository,
} from '../../src/save/LocalStorageSaveRepository.ts';
import {
  saveSlots,
  type SaveRepository,
  type SlotWrite,
  type GuardedWrite,
} from '../../src/save/SaveRepository.ts';
import {
  validateProfile,
  type FixtureProfile,
} from '../../src/save/profile.ts';

function owner(
  repository: SaveRepository,
  profile = createFixtureProfileStore(),
) {
  const coordinator = new SaveCoordinator({
    repository,
    profile,
    versions: fixtureSaveVersions,
    references,
    registry: createFixtureEventRegistry(),
    createSession: (seed) => createFixtureSession(seed, profile),
  });
  const active = () => coordinator.getSnapshot().session;
  active().controller.start();
  return { coordinator, profile, active };
}
function choose(session: ReturnType<typeof createFixtureSession>, index = 0) {
  expect(session.controller.continue(session.controller.getSnapshot())).toBe(
    true,
  );
  expect(
    session.controller.choose(session.controller.getSnapshot(), index),
  ).toBe(true);
}
function gate() {
  let enter!: () => void;
  let release!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    entered,
    release,
    wait: () => {
      enter();
      return pending;
    },
  };
}
class DelayedLocalStorageRepository extends LocalStorageSaveRepository {
  beforeSave: (() => Promise<void>) | null = null;
  afterSave: (() => Promise<void>) | null = null;
  beforeProfileSave: (() => Promise<void>) | null = null;
  override async save(
    slot: Parameters<SaveRepository['save']>[0],
    data: FixtureSaveEnvelope,
    write: SlotWrite,
  ) {
    await this.beforeSave?.();
    await super.save(slot, data, write);
    await this.afterSave?.();
  }
  override async saveProfile(data: FixtureProfile, write: GuardedWrite) {
    await this.beforeProfileSave?.();
    await super.saveProfile(data, write);
  }
}

function backend(kind: 'fake' | 'localStorage') {
  const storage = new TestStorage();
  const repository =
    kind === 'fake'
      ? new MemorySaveRepository()
      : new DelayedLocalStorageRepository(() => storage);
  return {
    repository,
    storage,
    profileBytes: () =>
      repository instanceof MemorySaveRepository
        ? JSON.stringify(repository.profile)
        : storage.getItem(keys.profile),
  };
}

it('3A-F01: a disposed delayed save cannot overwrite a newer owner save', async () => {
  const repository = new MemorySaveRepository();
  const profile = createFixtureProfileStore();
  const makeOwner = () => {
    const owner = new SaveCoordinator({
      repository,
      profile,
      versions: fixtureSaveVersions,
      references,
      registry: createFixtureEventRegistry(),
      createSession: (seed) => createFixtureSession(seed, profile),
    });
    owner.getSnapshot().session.controller.start();
    return owner;
  };
  const first = makeOwner();
  let release: (() => void) | undefined;
  repository.beforeSave = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  const pending = first.save('manual-1').catch((error: unknown) => error);
  await vi.waitFor(() => expect(release).toBeTypeOf('function'));
  first.dispose();
  repository.beforeSave = null;
  const second = makeOwner();
  const saved = await second.save('manual-1');
  const bytes = JSON.stringify(repository.slots.get('manual-1'));
  release?.();
  expect(await pending).toBeInstanceOf(Error);
  expect(JSON.stringify(repository.slots.get('manual-1'))).toBe(bytes);
  expect(repository.slots.get('manual-1')).toEqual(saved);
  second.dispose();
});

describe.each(['fake', 'localStorage'] as const)(
  '%s guarded asynchronous write boundaries',
  (kind) => {
    it('3A-F01: stale completion cannot overwrite B or unlock a pending B operation', async () => {
      const { repository } = backend(kind);
      const profile = createFixtureProfileStore();
      const first = owner(repository, profile);
      const a = gate();
      repository.beforeSave = a.wait;
      let success = 0;
      const pendingA = first.coordinator.save('manual-1').then(
        () => {
          success++;
        },
        (error: unknown) => error,
      );
      await a.entered;
      first.coordinator.dispose();
      const b = gate();
      repository.beforeSave = b.wait;
      const second = owner(repository, profile);
      const pendingB = second.coordinator.save('manual-1');
      await b.entered;
      a.release();
      expect(await pendingA).toMatchObject({
        slotCommitted: false,
        profileCommitted: true,
      });
      expect(success).toBe(0);
      expect((await repository.load('manual-1')).raw).toBeNull();
      await expect(second.coordinator.newRun()).rejects.toThrow('busy');
      await expect(second.coordinator.load('manual-1')).rejects.toThrow('busy');
      b.release();
      const savedB = await pendingB;
      expect((await repository.load('manual-1')).raw).toBe(
        JSON.stringify(savedB),
      );
      second.coordinator.dispose();
    });

    it('3A-F01: B writes first; a late disposed A never changes its bytes', async () => {
      const { repository } = backend(kind);
      const profile = createFixtureProfileStore();
      const first = owner(repository, profile);
      const a = gate();
      repository.beforeSave = a.wait;
      const pendingA = first.coordinator
        .save('autosave')
        .catch((error: unknown) => error);
      await a.entered;
      first.coordinator.dispose();
      repository.beforeSave = null;
      const second = owner(repository, profile);
      choose(second.active(), 1);
      const saved = await second.coordinator.save('autosave');
      a.release();
      expect(await pendingA).toBeInstanceOf(SaveWriteFailure);
      expect((await repository.load('autosave')).raw).toBe(
        JSON.stringify(saved),
      );
      expect(second.active().store.getState().effectCount).toBe(1);
      second.coordinator.dispose();
    });

    it('records a write before disposal, rejects its stale result, and preserves newer bytes', async () => {
      const { repository } = backend(kind);
      const profile = createFixtureProfileStore();
      const first = owner(repository, profile);
      const a = gate();
      repository.afterSave = a.wait;
      const pending = first.coordinator
        .save('manual-1')
        .catch((error: unknown) => error);
      await a.entered;
      const written = (await repository.load('manual-1')).raw;
      expect(written).not.toBeNull();
      first.coordinator.dispose();
      repository.afterSave = null;
      const second = owner(repository, profile);
      if (written === null) throw new Error('Expected committed bytes');
      const savedB = await second.coordinator.save('manual-1', {
        overwrite: { expectedRaw: written },
      });
      a.release();
      expect(await pending).toMatchObject({
        slotCommitted: true,
        profileCommitted: true,
      });
      expect((await repository.load('manual-1')).raw).toBe(
        JSON.stringify(savedB),
      );
      second.coordinator.dispose();
    });

    it('3A-F01: disposed pending profile writes cannot rewind a newer history', async () => {
      const { repository, profileBytes } = backend(kind);
      const id = crypto.randomUUID();
      const first = owner(repository, createFixtureProfileStore(id));
      const a = gate();
      repository.beforeProfileSave = a.wait;
      const pending = first.coordinator
        .persistProfile()
        .catch((error: unknown) => error);
      await a.entered;
      first.coordinator.dispose();
      repository.beforeProfileSave = null;
      const second = owner(
        repository,
        createFixtureProfileStore(id, [
          'fixture_start_001',
          'fixture_branch_b_001',
        ]),
      );
      const saved = await second.coordinator.persistProfile();
      a.release();
      expect(await pending).toMatchObject({ profileCommitted: false });
      expect(profileBytes()).toBe(JSON.stringify(saved));
      second.coordinator.dispose();
    });

    it('rejects a profile snapshot changed in memory during a delayed write', async () => {
      const { repository, profileBytes } = backend(kind);
      const current = owner(repository);
      await current.coordinator.persistProfile();
      const before = profileBytes();
      const a = gate();
      repository.beforeProfileSave = a.wait;
      const pending = current.coordinator
        .persistProfile()
        .catch((error: unknown) => error);
      await a.entered;
      current.profile.recordRead('fixture_branch_a_001');
      a.release();
      expect(await pending).toMatchObject({
        message: 'Stale profile snapshot',
        profileCommitted: false,
      });
      expect(profileBytes()).toBe(before);
      repository.beforeProfileSave = null;
      const saved = await current.coordinator.persistProfile();
      expect(saved.readLineIds).toContain('fixture_branch_a_001');
      current.coordinator.dispose();
    });

    it('merges newer persisted read history instead of overwriting it with a hydrated subset', async () => {
      const { repository } = backend(kind);
      const first = owner(repository);
      choose(first.active());
      const history = await first.coordinator.persistProfile();
      first.coordinator.dispose();
      const second = owner(
        repository,
        createFixtureProfileStore(history.profileId),
      );
      const saved = await second.coordinator.persistProfile();
      expect(saved.readLineIds).toEqual(history.readLineIds);
      expect(second.profile.getState().readLineIds).toEqual(
        history.readLineIds,
      );
      second.coordinator.dispose();
    });
  },
);

describe('LocalStorage repository data safety with the real coordinator and Ink runtime', () => {
  it.each(['completed', 'new-run'] as const)(
    'revokes a retained write permit after %s',
    async (boundary) => {
      const storage = new TestStorage();
      let retained: SlotWrite | undefined;
      class RetainingRepository extends LocalStorageSaveRepository {
        override async save(
          slot: Parameters<SaveRepository['save']>[0],
          data: FixtureSaveEnvelope,
          write: SlotWrite,
        ) {
          retained = write;
          await super.save(slot, data, write);
        }
      }
      const current = owner(new RetainingRepository(() => storage));
      await current.coordinator.save('manual-1');
      const before = storage.getItem(keys.slots['manual-1']);
      if (boundary === 'new-run') await current.coordinator.newRun();
      if (!retained) throw new Error('Expected retained permit');
      const expired = retained;
      expect(() =>
        expired.permit.commit(() => {
          storage.setItem(keys.slots['manual-1'], 'expired write');
          return undefined;
        }),
      ).toThrow('Stale');
      expect(storage.getItem(keys.slots['manual-1'])).toBe(before);
      current.coordinator.dispose();
    },
  );

  it('reports post-write repository failure as committed, without rollback or automatic replay', async () => {
    const storage = new TestStorage();
    const repository = new DelayedLocalStorageRepository(() => storage);
    const current = owner(repository);
    repository.afterSave = async () => {
      throw new Error('completion failed after writing');
    };
    await expect(current.coordinator.save('manual-1')).rejects.toMatchObject({
      slotCommitted: true,
      profileCommitted: true,
      message: 'completion failed after writing',
    });
    const inspection = await current.coordinator.inspect('manual-1');
    expect(inspection.status).toBe('valid');
    expect(
      storage.writes.filter((key) => key === keys.slots['manual-1']),
    ).toHaveLength(1);
    repository.afterSave = null;
    await current.coordinator.load('manual-1');
    expect(current.active().notificationCount()).toBe(0);
    current.coordinator.dispose();
  });

  it.each(saveSlots)(
    'save/load/inspect %s restores a coherent committed checkpoint without replay',
    async (slot) => {
      const storage = new TestStorage();
      const repository = new LocalStorageSaveRepository(() => storage);
      const current = owner(repository);
      choose(current.active(), 1);
      const saved = await current.coordinator.save(slot);
      expect(storage.getItem(keys.slots[slot])).toBe(JSON.stringify(saved));
      const inspected = await current.coordinator.inspect(slot);
      expect(inspected.status).toBe('valid');
      const history = current.profile.getState();
      await current.coordinator.newRun();
      current.active().controller.start();
      await current.coordinator.load(slot);
      expect(current.active().store.getState()).toEqual(saved.game);
      expect(current.active().controller.getBacklog()).toEqual(
        saved.narrative.backlog,
      );
      expect(current.active().notificationCount()).toBe(0);
      expect(current.profile.getState()).toBe(history);
      expect(
        current
          .active()
          .controller.continue(current.active().controller.getSnapshot()),
      ).toBe(true);
      expect(current.active().controller.getSnapshot().line?.text).toContain(
        'ยืนยันข้อมูลหลังบันทึก',
      );
      expect(current.active().store.getState().effectCount).toBe(1);
      expect(
        saveSlots
          .filter((other) => other !== slot)
          .every((other) => storage.getItem(keys.slots[other]) === null),
      ).toBe(true);
      current.coordinator.dispose();
    },
  );

  const mutations: [string, (save: FixtureSaveEnvelope) => string][] = [
    ['corrupt', () => '{'],
    ['corrupt', () => 'null'],
    [
      'unsupported-schema',
      (s) => JSON.stringify({ ...s, saveSchemaVersion: 2 }),
    ],
    [
      'unsupported-schema',
      (s) => JSON.stringify({ ...s, saveSchemaVersion: 0 }),
    ],
    [
      'incompatible-build',
      (s) => JSON.stringify({ ...s, appBuildVersion: '0.0.0+m1-batch-3a' }),
    ],
    [
      'incompatible-story',
      (s) => JSON.stringify({ ...s, storyCompatibilityVersion: 'other-story' }),
    ],
    ['unsupported-scope', (s) => JSON.stringify({ ...s, scope: 'release' })],
    [
      'foreign-profile',
      (s) => JSON.stringify({ ...s, profileId: 'different-profile' }),
    ],
    [
      'corrupt',
      (s) => JSON.stringify({ ...s, game: { ...s.game, flags: {} } }),
    ],
    [
      'corrupt',
      (s) =>
        JSON.stringify({
          ...s,
          narrative: { ...s.narrative, inkStateJson: '{}' },
        }),
    ],
  ];
  it.each(mutations)(
    'preserves and protects %s data (case %#)',
    async (status, mutate) => {
      const storage = new TestStorage();
      const current = owner(new LocalStorageSaveRepository(() => storage));
      const save = await current.coordinator.save('manual-1');
      const invalid = mutate(save);
      storage.bytes.set(keys.slots['manual-1'], invalid);
      expect(await current.coordinator.inspect('manual-1')).toMatchObject({
        status,
        raw: invalid,
      });
      const beforeWrites = storage.writes.length;
      await expect(
        current.coordinator.save('manual-1', {
          overwrite: { expectedRaw: invalid },
        }),
      ).rejects.toThrow('Protected');
      await expect(current.coordinator.load('manual-1')).rejects.toThrow();
      expect(storage.getItem(keys.slots['manual-1'])).toBe(invalid);
      expect(storage.writes.length).toBe(beforeWrites);
      expect(current.active().store.getState().effectCount).toBe(0);
      current.coordinator.dispose();
    },
  );

  it('checks slot bytes again at the physical boundary after delayed preparation', async () => {
    const storage = new TestStorage();
    const repository = new DelayedLocalStorageRepository(() => storage);
    const current = owner(repository);
    const first = await current.coordinator.save('manual-1');
    const a = gate();
    repository.beforeSave = a.wait;
    const pending = current.coordinator
      .save('manual-1')
      .catch((error: unknown) => error);
    await a.entered;
    const external = JSON.stringify({ ...first, saveSchemaVersion: 99 });
    storage.bytes.set(keys.slots['manual-1'], external);
    a.release();
    expect(await pending).toMatchObject({ slotCommitted: false });
    expect(storage.getItem(keys.slots['manual-1'])).toBe(external);
    current.coordinator.dispose();
  });

  it('requires explicit inspected-byte consent before replacing another run, including autosave', async () => {
    const storage = new TestStorage();
    const current = owner(new LocalStorageSaveRepository(() => storage));
    await current.coordinator.save('autosave');
    const old = storage.getItem(keys.slots.autosave);
    await current.coordinator.newRun();
    current.active().controller.start();
    await expect(current.coordinator.save('autosave')).rejects.toThrow(
      'explicit',
    );
    expect(storage.getItem(keys.slots.autosave)).toBe(old);
    await expect(
      current.coordinator.save('autosave', {
        overwrite: { expectedRaw: 'old confirmation' },
      }),
    ).rejects.toThrow('stale');
    if (old === null) throw new Error('Missing autosave');
    const saved = await current.coordinator.save('autosave', {
      overwrite: { expectedRaw: old },
    });
    expect(storage.getItem(keys.slots.autosave)).toBe(JSON.stringify(saved));
    current.coordinator.dispose();
  });

  it('keeps each slot/run separate and does not rewind persisted profile history', async () => {
    const storage = new TestStorage();
    const repository = new LocalStorageSaveRepository(() => storage);
    const current = owner(repository);
    const saves: FixtureSaveEnvelope[] = [];
    for (const [index, slot] of saveSlots.entries()) {
      if (index) {
        await current.coordinator.newRun();
        current.active().controller.start();
      }
      choose(current.active(), index % 2);
      saves.push(await current.coordinator.save(slot));
    }
    expect(new Set(saves.map((save) => save.game.runId)).size).toBe(4);
    const profile = storage.getItem(keys.profile);
    for (const [index, slot] of saveSlots.entries()) {
      await current.coordinator.load(slot);
      expect(current.active().store.getState()).toEqual(saves[index].game);
      expect(current.active().controller.getBacklog()).toEqual(
        saves[index].narrative.backlog,
      );
      expect(current.active().notificationCount()).toBe(0);
      expect(storage.getItem(keys.profile)).toBe(profile);
    }
    current.coordinator.dispose();
    const stored = await repository.loadProfile();
    if (stored.kind !== 'data') throw new Error('Expected profile');
    const parsed = validateProfile(stored.value, references);
    const hydrated = createFixtureProfileStore(
      parsed.profileId,
      parsed.readLineIds,
    );
    expect(hydrated.getState().readLineIds).toContain('fixture_branch_a_001');
    expect(hydrated.getState().readLineIds).toContain('fixture_branch_b_001');
  });

  it.each(['quota', 'write-error'])(
    'reports %s after profile commit without claiming the game saved',
    async (failure) => {
      const storage = new TestStorage();
      const current = owner(new LocalStorageSaveRepository(() => storage));
      await current.coordinator.save('manual-1');
      const old = storage.getItem(keys.slots['manual-1']);
      choose(current.active());
      storage.beforeSet = (key) => {
        if (key === keys.slots['manual-1'])
          throw new DOMException(
            'cannot write',
            failure === 'quota' ? 'QuotaExceededError' : 'UnknownError',
          );
      };
      await expect(current.coordinator.save('manual-1')).rejects.toMatchObject({
        slotCommitted: false,
        profileCommitted: true,
      });
      expect(storage.getItem(keys.slots['manual-1'])).toBe(old);
      expect(storage.getItem(keys.profile)).toContain('fixture_branch_a_001');
      expect(current.active().store.getState().effectCount).toBe(1);
      storage.beforeSet = null;
      await current.coordinator.save('manual-1');
      expect(storage.getItem(keys.slots['manual-1'])).not.toBe(old);
      current.coordinator.dispose();
    },
  );

  it('reports an unavailable storage getter and never classifies it as an empty slot', async () => {
    const current = owner(
      new LocalStorageSaveRepository(() => {
        throw new DOMException('blocked', 'SecurityError');
      }),
    );
    await expect(current.coordinator.inspect('autosave')).rejects.toThrow(
      'blocked',
    );
    await expect(current.coordinator.save('autosave')).rejects.toMatchObject({
      slotCommitted: false,
      profileCommitted: false,
    });
    expect(current.active().controller.getSnapshot().phase).toBe('line');
    current.coordinator.dispose();
  });

  it('does not touch unrelated origin keys or choose namespaces by build', async () => {
    const storage = new TestStorage();
    storage.bytes.set('other-app', 'untouched');
    const current = owner(new LocalStorageSaveRepository(() => storage));
    await current.coordinator.save('autosave');
    expect(storage.getItem('other-app')).toBe('untouched');
    expect(Object.values(keys.slots)).toHaveLength(4);
    expect(
      Object.values(keys.slots).every(
        (key) => !key.includes(fixtureSaveVersions.appBuildVersion),
      ),
    ).toBe(true);
    current.coordinator.dispose();
  });
});

describe('profile validation and guarded creation', () => {
  const mutations: ((profile: FixtureProfile) => string)[] = [
    () => '{',
    (p) => JSON.stringify({ ...p, profileSchemaVersion: 2 }),
    (p) => JSON.stringify({ ...p, readLineIds: ['unknown'] }),
    (p) =>
      JSON.stringify({
        ...p,
        readLineIds: ['fixture_start_001', 'fixture_start_001'],
      }),
    (p) => JSON.stringify({ ...p, profileId: 'foreign-profile' }),
    (p) => JSON.stringify({ ...p, settings: {} }),
  ];
  it.each(mutations)(
    'blocks corrupt/unsupported/foreign profiles without changing any bytes (case %#)',
    async (mutate) => {
      const storage = new TestStorage();
      const current = owner(new LocalStorageSaveRepository(() => storage));
      const profile = await current.coordinator.persistProfile();
      const invalid = mutate(profile);
      storage.bytes.set(keys.profile, invalid);
      const writes = storage.writes.length;
      await expect(current.coordinator.persistProfile()).rejects.toThrow();
      await expect(current.coordinator.save('manual-1')).rejects.toThrow();
      expect(storage.getItem(keys.profile)).toBe(invalid);
      expect(storage.getItem(keys.slots['manual-1'])).toBeNull();
      expect(storage.writes.length).toBe(writes);
      current.coordinator.dispose();
    },
  );

  it('blocks missing profile with existing slots; never adopts their identity', async () => {
    const storage = new TestStorage();
    const repository = new LocalStorageSaveRepository(() => storage);
    const first = owner(repository);
    await first.coordinator.save('manual-2');
    first.coordinator.dispose();
    const old = storage.getItem(keys.slots['manual-2']);
    storage.removeItem(keys.profile);
    const second = owner(repository);
    await expect(second.coordinator.persistProfile()).rejects.toThrow(
      'Missing profile',
    );
    await expect(second.coordinator.save('manual-1')).rejects.toThrow(
      'Missing profile',
    );
    expect(storage.getItem(keys.profile)).toBeNull();
    expect(storage.getItem(keys.slots['manual-2'])).toBe(old);
    second.coordinator.dispose();
  });

  it('checks for newly inserted slots immediately before creating a missing profile', async () => {
    const storage = new TestStorage();
    const repository = new DelayedLocalStorageRepository(() => storage);
    const current = owner(repository);
    const a = gate();
    repository.beforeProfileSave = a.wait;
    const pending = current.coordinator
      .persistProfile()
      .catch((error: unknown) => error);
    await a.entered;
    storage.bytes.set(keys.slots['manual-3'], '{');
    a.release();
    expect(await pending).toMatchObject({ profileCommitted: false });
    expect(storage.getItem(keys.profile)).toBeNull();
    expect(storage.getItem(keys.slots['manual-3'])).toBe('{');
    current.coordinator.dispose();
  });

  it('rejects a changed persisted profile at the final boundary instead of losing newer IDs', async () => {
    const storage = new TestStorage();
    const repository = new DelayedLocalStorageRepository(() => storage);
    const current = owner(repository);
    const initial = await current.coordinator.persistProfile();
    const a = gate();
    repository.beforeProfileSave = a.wait;
    const pending = current.coordinator
      .persistProfile()
      .catch((error: unknown) => error);
    await a.entered;
    const newer = JSON.stringify({
      ...initial,
      readLineIds: [...initial.readLineIds, 'fixture_branch_b_001'],
    });
    storage.bytes.set(keys.profile, newer);
    a.release();
    expect(await pending).toMatchObject({ profileCommitted: false });
    expect(storage.getItem(keys.profile)).toBe(newer);
    current.coordinator.dispose();
  });

  it('rechecks the profile at the slot boundary and preserves the existing game save', async () => {
    const storage = new TestStorage();
    const repository = new DelayedLocalStorageRepository(() => storage);
    const current = owner(repository);
    await current.coordinator.save('manual-1');
    const old = storage.getItem(keys.slots['manual-1']);
    const a = gate();
    repository.beforeSave = a.wait;
    const pending = current.coordinator
      .save('manual-1')
      .catch((error: unknown) => error);
    await a.entered;
    storage.bytes.set(keys.profile, '{');
    a.release();
    expect(await pending).toMatchObject({ slotCommitted: false });
    expect(storage.getItem(keys.slots['manual-1'])).toBe(old);
    expect(storage.getItem(keys.profile)).toBe('{');
    current.coordinator.dispose();
  });

  it('does not write the slot if profile persistence fails, and does not reset global history', async () => {
    const storage = new TestStorage();
    const current = owner(new LocalStorageSaveRepository(() => storage));
    storage.beforeSet = () => {
      throw new DOMException('quota', 'QuotaExceededError');
    };
    await expect(current.coordinator.save('manual-1')).rejects.toMatchObject({
      profileCommitted: false,
      slotCommitted: false,
    });
    expect(storage.getItem(keys.profile)).toBeNull();
    expect(storage.getItem(keys.slots['manual-1'])).toBeNull();
    expect(current.profile.getState().readLineIds).toEqual([
      'fixture_start_001',
    ]);
    current.coordinator.dispose();
  });
});
