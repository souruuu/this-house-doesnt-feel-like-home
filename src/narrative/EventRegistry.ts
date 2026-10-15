import type { PresentationEvent } from './types.ts';

export interface EventDefinition {
  id: string;
  sceneId: string;
  category: 'presentation' | 'domain';
}

export class EventRegistry {
  private readonly definitions = new Map<string, Readonly<EventDefinition>>();

  constructor(definitions: readonly EventDefinition[]) {
    for (const definition of definitions) {
      if (this.definitions.has(definition.id))
        throw new Error(`Duplicate Event ID: ${definition.id}`);
      this.definitions.set(definition.id, Object.freeze({ ...definition }));
    }
  }

  resolvePresentation(id: string): Readonly<PresentationEvent> {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Unknown event: ${id}`);
    if (definition.category !== 'presentation')
      throw new Error(`Domain execution is outside Batch 1: ${id}`);
    return Object.freeze({ ...definition, category: 'presentation' });
  }
}

export const fixtureEventDefinitions: readonly EventDefinition[] = [
  {
    id: 'fixture.presentation.started',
    sceneId: 'fixture.main',
    category: 'presentation',
  },
  {
    id: 'fixture.presentation.rejoined',
    sceneId: 'fixture.rejoin',
    category: 'presentation',
  },
];

export function createFixtureEventRegistry() {
  return new EventRegistry(fixtureEventDefinitions);
}
