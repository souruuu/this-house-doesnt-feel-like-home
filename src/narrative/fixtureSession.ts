import compiled from '../../generated/narrative/technical_fixture.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from './EventRegistry.ts';
import { NarrativeController } from './NarrativeController.ts';
import { createNarrativeQueryPort } from './NarrativeQueryPort.ts';
import {
  createFixtureDomainStore,
  type FixtureDomainState,
} from '../state/fixtureDomainStore.ts';
import { type FixtureProfileStore } from '../state/fixtureProfileStore.ts';
import { SaveCoordinator } from '../save/SaveCoordinator.ts';
import { fixtureSaveVersions } from '../save/types.ts';
import { FixtureRuntime } from './FixtureRuntime.ts';
import { LocalStorageSaveRepository } from '../save/LocalStorageSaveRepository.ts';
import type { SaveRepository } from '../save/SaveRepository.ts';

// Imported only by the dev/QA panel, never a release entry or production state.
export function createFixtureSession(
  seed?: FixtureDomainState,
  profile?: FixtureProfileStore,
) {
  const store = createFixtureDomainStore(seed);
  const notifications: string[] = [];
  const controller = new NarrativeController(
    JSON.stringify(compiled),
    references,
    createFixtureEventRegistry(),
    createNarrativeQueryPort(store),
    {
      dispatch: (event) => {
        notifications.push(event.id);
      },
    },
    store,
  );
  if (profile)
    controller.subscribe((view) => {
      if (view.phase === 'line' && view.line) profile.recordRead(view.line.id);
    });
  return Object.freeze({
    controller,
    store,
    notificationCount: () => notifications.length,
  });
}

export function createFixtureRuntime(
  repository: SaveRepository = new LocalStorageSaveRepository(),
) {
  return new FixtureRuntime({
    repository,
    references,
    createCoordinator: (profile) =>
      new SaveCoordinator({
        profile,
        versions: fixtureSaveVersions,
        references,
        registry: createFixtureEventRegistry(),
        createSession: (seed) => createFixtureSession(seed, profile),
        repository,
      }),
  });
}

export type FixtureSession = ReturnType<typeof createFixtureSession>;
