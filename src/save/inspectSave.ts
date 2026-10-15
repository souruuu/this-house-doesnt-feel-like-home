import type { EventRegistry } from '../narrative/EventRegistry.ts';
import type { FixtureReferences } from '../narrative/types.ts';
import type { StoredRecord } from './SaveRepository.ts';
import {
  supportsFixtureBuild,
  type FixtureSaveEnvelope,
  type SaveVersions,
} from './types.ts';
import { validateSaveEnvelope } from './validateSave.ts';

export type SaveInspection =
  | { readonly status: 'empty'; readonly raw: null }
  | {
      readonly status: 'valid';
      readonly raw: string;
      readonly envelope: FixtureSaveEnvelope;
    }
  | {
      readonly status:
        | 'corrupt'
        | 'unsupported-schema'
        | 'incompatible-build'
        | 'incompatible-story'
        | 'foreign-profile'
        | 'unsupported-scope';
      readonly raw: string;
    };

export function inspectSave(
  record: StoredRecord,
  versions: SaveVersions,
  profileId: string,
  references: FixtureReferences,
  registry: EventRegistry,
): SaveInspection {
  if (record.kind === 'empty')
    return Object.freeze({ status: 'empty', raw: null });
  const result = (
    status: Exclude<SaveInspection['status'], 'valid' | 'empty'>,
  ): SaveInspection => Object.freeze({ status, raw: record.raw });
  if (record.kind === 'corrupt') return result('corrupt');
  const input = record.value;
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    return result('corrupt');
  if (!('scope' in input) || input.scope !== 'technical-fixture-only')
    return result('unsupported-scope');
  if (
    !('saveSchemaVersion' in input) ||
    !Number.isSafeInteger(input.saveSchemaVersion)
  )
    return result('corrupt');
  if (input.saveSchemaVersion !== versions.saveSchemaVersion)
    return result('unsupported-schema');
  if (
    !('storyCompatibilityVersion' in input) ||
    typeof input.storyCompatibilityVersion !== 'string' ||
    !('appBuildVersion' in input) ||
    typeof input.appBuildVersion !== 'string' ||
    !('profileId' in input) ||
    typeof input.profileId !== 'string'
  )
    return result('corrupt');
  if (input.storyCompatibilityVersion !== versions.storyCompatibilityVersion)
    return result('incompatible-story');
  if (!supportsFixtureBuild(input.appBuildVersion, versions))
    return result('incompatible-build');
  if (input.profileId !== profileId) return result('foreign-profile');
  try {
    return Object.freeze({
      status: 'valid',
      raw: record.raw,
      envelope: validateSaveEnvelope(
        input,
        versions,
        profileId,
        references,
        registry,
      ),
    });
  } catch {
    return result('corrupt');
  }
}
