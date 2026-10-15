import { expect, test } from '@playwright/test';
import type { SaveRepository, SaveSlot } from '../../src/save/SaveRepository';

// Repository QA only: no startup gate, scheduling, resume flow or storage UI.
test('native localStorage preserves four slots and rejects a disposed delayed writer', async ({
  page,
}) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const [
      { LocalStorageSaveRepository },
      { SaveCoordinator },
      { createFixtureSession },
      { createFixtureProfileStore },
      { fixtureSaveVersions },
      { createFixtureEventRegistry },
      { default: references },
    ] = await Promise.all([
      load('/src/save/LocalStorageSaveRepository.ts'),
      load('/src/save/SaveCoordinator.ts'),
      load('/src/narrative/fixtureSession.ts'),
      load('/src/state/fixtureProfileStore.ts'),
      load('/src/save/types.ts'),
      load('/src/narrative/EventRegistry.ts'),
      load('/narrative/fixtures/references.json'),
    ]);
    const native = new LocalStorageSaveRepository();
    const profile = createFixtureProfileStore();
    const makeOwner = (repository: SaveRepository) => {
      const owner = new SaveCoordinator({
        repository,
        profile,
        references,
        versions: fixtureSaveVersions,
        registry: createFixtureEventRegistry(),
        createSession: (seed: Parameters<typeof createFixtureSession>[0]) =>
          createFixtureSession(seed, profile),
      });
      owner.getSnapshot().session.controller.start();
      return owner;
    };
    const slots: SaveSlot[] = ['autosave', 'manual-1', 'manual-2', 'manual-3'];
    const first = makeOwner(native);
    const roundTrips = [];
    for (const slot of slots) {
      const saved = await first.save(slot);
      const inspected = await first.inspect(slot);
      await first.load(slot);
      roundTrips.push(
        inspected.status === 'valid' &&
          (await native.load(slot)).raw === JSON.stringify(saved) &&
          first.getSnapshot().session.notificationCount() === 0,
      );
    }
    first.dispose();
    let release!: () => void;
    let enter!: () => void;
    const waiting = new Promise<void>((resolve) => {
      enter = resolve;
    });
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const wrapper: SaveRepository = {
      load: (slot) => native.load(slot),
      loadProfile: () => native.loadProfile(),
      saveProfile: (data, write) => native.saveProfile(data, write),
      delete: (slot, write) => native.delete(slot, write),
      save: async (slot, data, write) => {
        enter();
        await delayed;
        await native.save(slot, data, write);
      },
    };
    const original = (await native.load('autosave')).raw;
    if (original === null) throw new Error('Missing native autosave');
    const old = makeOwner(wrapper);
    const pending = old
      .save('autosave', { overwrite: { expectedRaw: original } })
      .then(
        () => ({ stale: false, slotCommitted: true }),
        (error: Error & { slotCommitted: boolean }) => ({
          stale: error.message.includes('Stale'),
          slotCommitted: error.slotCommitted,
        }),
      );
    await waiting;
    old.dispose();
    const current = makeOwner(native);
    const saved = await current.save('autosave', {
      overwrite: { expectedRaw: original },
    });
    release();
    const completion = await pending;
    const unchanged =
      (await native.load('autosave')).raw === JSON.stringify(saved);
    current.dispose();
    return { roundTrips, completion, unchanged };
  });
  expect(result.roundTrips).toEqual([true, true, true, true]);
  expect(result.completion).toEqual({ stale: true, slotCommitted: false });
  expect(result.unchanged).toBe(true);
});
