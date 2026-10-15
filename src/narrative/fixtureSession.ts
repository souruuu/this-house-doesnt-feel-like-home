import compiled from '../../generated/narrative/technical_fixture.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from './EventRegistry.ts';
import { NarrativeController } from './NarrativeController.ts';
import { createNarrativeQueryPort } from './NarrativeQueryPort.ts';
import {
  createFixtureDomainStore,
  type FixtureDomainState,
} from '../state/fixtureDomainStore.ts';
import {
  createFixtureProfileStore,
  type FixtureProfileStore,
} from '../state/fixtureProfileStore.ts';
import { SaveCoordinator } from '../save/SaveCoordinator.ts';
import { fixtureSaveVersions } from '../save/types.ts';

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

export function createFixtureRuntime() {
  const profile = createFixtureProfileStore();
  return new SaveCoordinator({
    profile,
    versions: fixtureSaveVersions,
    references,
    registry: createFixtureEventRegistry(),
    createSession: (seed) => createFixtureSession(seed, profile),
    repository: null,
  });
}

export type FixtureSession = ReturnType<typeof createFixtureSession>;
