import type { NarrativeSnapshot } from '../narrative/types.ts';
import type { FixtureDomainState } from '../state/fixtureDomainStore.ts';

export interface SaveVersions {
  readonly appBuildVersion: string;
  readonly saveSchemaVersion: number;
  readonly storyCompatibilityVersion: string;
}

// This identity supports this technical fixture/build only, not release saves.
export const fixtureSaveVersions: SaveVersions = Object.freeze({
  appBuildVersion: '0.0.0+m1-batch-3b-1',
  saveSchemaVersion: 1,
  storyCompatibilityVersion: 'technical-fixture-checkpoint-v1',
});

export interface FixtureSaveEnvelope extends SaveVersions {
  readonly scope: 'technical-fixture-only';
  readonly profileId: string;
  readonly timestamp: number; // Unix epoch milliseconds.
  readonly game: FixtureDomainState;
  readonly narrative: NarrativeSnapshot;
}
