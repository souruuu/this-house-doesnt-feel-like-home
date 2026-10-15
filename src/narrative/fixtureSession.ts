import { createStore } from 'zustand/vanilla';
import compiled from '../../generated/narrative/technical_fixture.json';
import references from '../../narrative/fixtures/references.json';
import { createFixtureEventRegistry } from './EventRegistry.ts';
import { NarrativeController } from './NarrativeController.ts';
import {
  createNarrativeQueryPort,
  type FixtureFacts,
} from './NarrativeQueryPort.ts';

// Imported only by the dev/QA panel, never a release entry or production state.
export function createFixtureSession() {
  const store = createStore<FixtureFacts>(() => ({
    flags: { 'fixture.branch_enabled': true },
  }));
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
  );
  return { controller, notificationCount: () => notifications.length };
}

export type FixtureSession = ReturnType<typeof createFixtureSession>;
