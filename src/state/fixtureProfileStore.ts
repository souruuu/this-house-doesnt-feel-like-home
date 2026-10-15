import { createStore } from 'zustand/vanilla';

// Hydration receives validated profile data. No settings defaults or slot restore.
export function createFixtureProfileStore(
  profileId: string = crypto.randomUUID(),
  readLineIds: readonly string[] = [],
) {
  if (!profileId.trim()) throw new Error('Profile identity is required');
  if (
    readLineIds.some((id) => !id.trim()) ||
    new Set(readLineIds).size !== readLineIds.length
  )
    throw new Error('Invalid profile read history');
  const store = createStore(() =>
    Object.freeze({ profileId, readLineIds: Object.freeze([...readLineIds]) }),
  );
  return Object.freeze({
    getState: store.getState,
    recordRead(lineId: string) {
      const previous = store.getState();
      if (!previous.readLineIds.includes(lineId))
        store.setState(
          Object.freeze({
            profileId,
            readLineIds: Object.freeze([...previous.readLineIds, lineId]),
          }),
          true,
        );
    },
  });
}

export type FixtureProfileStore = ReturnType<typeof createFixtureProfileStore>;
