import compiled from '../../generated/narrative/demo.json';
import references from '../../narrative/production/references.json';
import { createDemoDomainStore } from '../state/demoDomainStore.ts';
import { createDemoEventRegistry } from './demoEvents.ts';
import { NarrativeController } from './NarrativeController.ts';
import { createNarrativeQueryPort } from './NarrativeQueryPort.ts';

export function createDemoSession() {
  const store = createDemoDomainStore();
  const controller = new NarrativeController(
    JSON.stringify(compiled),
    references,
    createDemoEventRegistry(),
    createNarrativeQueryPort(store),
    {
      dispatch() {
        throw new Error('No one-shot presentation events in emergency demo');
      },
    },
    store,
    { scope: 'emergency-demo-day1-day3' },
  );
  return Object.freeze({ store, controller });
}

export type DemoSession = ReturnType<typeof createDemoSession>;
export { references as demoReferences };
