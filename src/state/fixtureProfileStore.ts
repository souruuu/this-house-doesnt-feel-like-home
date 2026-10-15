import { createStore } from 'zustand/vanilla';

// Memory-only profile foundation. No settings defaults or persistence policy.
export function createFixtureProfileStore(profileId = crypto.randomUUID()) {
  if (!profileId.trim()) throw new Error('Profile identity is required');
  const store = createStore(() =>
    Object.freeze({ profileId, readLineIds: Object.freeze([] as string[]) }),
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
