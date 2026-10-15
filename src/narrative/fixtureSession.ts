import compiled from '../../generated/narrative/technical_fixture.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from './EventRegistry.ts';
import { NarrativeController } from './NarrativeController.ts';
import { createNarrativeQueryPort } from './NarrativeQueryPort.ts';
import { createFixtureDomainStore } from '../state/fixtureDomainStore.ts';

// Imported only by the dev/QA panel, never a release entry or production state.
export function createFixtureSession() {
  const store = createFixtureDomainStore();
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
  return { controller, store, notificationCount: () => notifications.length };
}

export type FixtureSession = ReturnType<typeof createFixtureSession>;
