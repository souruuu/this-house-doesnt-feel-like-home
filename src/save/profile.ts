import type { FixtureReferences } from '../narrative/types.ts';
import type { FixtureProfileStore } from '../state/fixtureProfileStore.ts';

export interface FixtureProfile {
  readonly scope: 'technical-fixture-only';
  readonly profileSchemaVersion: 1;
  readonly profileId: string;
  readonly readLineIds: readonly string[];
}

export function validateProfile(
  input: unknown,
  references: FixtureReferences,
): FixtureProfile {
  if (
    typeof input !== 'object' ||
    input === null ||
    Array.isArray(input) ||
    Object.getPrototypeOf(input) !== Object.prototype
  )
    throw new Error('Invalid profile');
  if (
    !('scope' in input) ||
    input.scope !== 'technical-fixture-only' ||
    !('profileSchemaVersion' in input) ||
    input.profileSchemaVersion !== 1
  )
    throw new Error('Unsupported profile scope/schema');
  if (
    Object.keys(input).length !== 4 ||
    !('profileId' in input) ||
    typeof input.profileId !== 'string' ||
    !input.profileId.trim() ||
    !('readLineIds' in input) ||
    !Array.isArray(input.readLineIds)
  )
    throw new Error('Invalid profile fields');
  const readLineIds = input.readLineIds.map((id: unknown) => {
    if (typeof id !== 'string' || !Object.hasOwn(references.lines, id))
      throw new Error('Unknown profile Line ID');
    return id;
  });
  if (new Set(readLineIds).size !== readLineIds.length)
    throw new Error('Duplicate profile Line ID');
  return Object.freeze({
    scope: 'technical-fixture-only',
    profileSchemaVersion: 1,
    profileId: input.profileId,
    readLineIds: Object.freeze(readLineIds),
  });
}

export function captureProfile(
  store: FixtureProfileStore,
  references: FixtureReferences,
) {
  return validateProfile(
    {
      scope: 'technical-fixture-only',
      profileSchemaVersion: 1,
      ...store.getState(),
    },
    references,
  );
}
