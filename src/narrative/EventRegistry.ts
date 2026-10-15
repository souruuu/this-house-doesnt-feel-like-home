import type { FixtureDomainAction, NarrativeEvent } from './types.ts';

interface EventIdentity {
  id: string;
  sceneId: string;
}

export type EventDefinition = EventIdentity &
  (
    | { category: 'presentation' }
    | { category: 'domain'; action: FixtureDomainAction }
  );

export class EventRegistry {
  private readonly definitions = new Map<string, Readonly<EventDefinition>>();

  constructor(definitions: readonly EventDefinition[]) {
    for (const definition of definitions) {
      if (this.definitions.has(definition.id))
        throw new Error(`Duplicate Event ID: ${definition.id}`);
      this.definitions.set(
        definition.id,
        Object.freeze(
          definition.category === 'domain'
            ? { ...definition, action: Object.freeze({ ...definition.action }) }
            : { ...definition },
        ),
      );
    }
  }

  resolve(id: string): Readonly<NarrativeEvent> {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Unknown event: ${id}`);
    return definition;
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
  {
    id: 'fixture.domain.branch_a',
    sceneId: 'fixture.main',
    category: 'domain',
    action: { kind: 'select-branch', branch: 'a' },
  },
  {
    id: 'fixture.domain.branch_b',
    sceneId: 'fixture.main',
    category: 'domain',
    action: { kind: 'select-branch', branch: 'b' },
  },
  {
    id: 'fixture.domain.rejoined',
    sceneId: 'fixture.rejoin',
    category: 'domain',
    action: { kind: 'record-rejoin' },
  },
];

export function createFixtureEventRegistry() {
  return new EventRegistry(fixtureEventDefinitions);
}
