import { createStore } from 'zustand/vanilla';
import {
  createDemoEventRegistry,
  demoFactDefinitions,
} from '../narrative/demoEvents.ts';
import type { DemoFactAction, DomainEvent } from '../narrative/types.ts';

export interface DemoDomainState {
  readonly runId: string;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly facts: readonly Readonly<DemoFactAction>[];
  readonly committedEventIds: readonly string[];
}

export function createDemoDomainStore() {
  const registry = createDemoEventRegistry();
  const store = createStore<DemoDomainState>(() => ({
    runId: crypto.randomUUID(),
    flags: Object.freeze(
      Object.fromEntries(demoFactDefinitions.map(([id]) => [id, false])),
    ),
    facts: Object.freeze([]),
    committedEventIds: Object.freeze([]),
  }));
  let committing = false;
  return Object.freeze({
    getState: store.getState,
    subscribe: store.subscribe,
    commit(events: readonly Readonly<DomainEvent>[]) {
      if (committing) throw new Error('Demo domain commit is locked');
      committing = true;
      try {
        const previous = store.getState();
        const flags = { ...previous.flags };
        const facts = [...previous.facts];
        const ids = new Set(previous.committedEventIds);
        for (const event of events) {
          const definition = registry.resolve(event.id);
          if (
            JSON.stringify(definition) !== JSON.stringify(event) ||
            definition.category !== 'domain' ||
            definition.action.kind !== 'record-demo-fact'
          )
            throw new Error('Unapproved demo event');
          if (ids.has(event.id)) continue;
          const action = definition.action;
          if (
            action.fact.startsWith('shelf_restored') &&
            !flags.kan_shelf_incident
          )
            throw new Error('Cleanup requires the observed shelf incident');
          if (
            (action.fact === 'shelf_restored_by_owner' &&
              flags.shelf_restored_together) ||
            (action.fact === 'shelf_restored_together' &&
              flags.shelf_restored_by_owner)
          )
            throw new Error('Cleanup branches are exclusive');
          if (action.fact === 'nut_food_interest' && !flags.nut_name)
            throw new Error(
              'Food discussion requires the actual preceding encounter',
            );
          flags[action.fact] = true;
          facts.push(action);
          ids.add(event.id);
        }
        if (ids.size === previous.committedEventIds.length)
          return { notificationError: null };
        const next = Object.freeze({
          ...previous,
          flags: Object.freeze(flags),
          facts: Object.freeze(facts),
          committedEventIds: Object.freeze([...ids]),
        });
        try {
          store.setState(next, true);
          return { notificationError: null };
        } catch (error) {
          return {
            notificationError:
              error instanceof Error ? error.message : String(error),
          };
        }
      } finally {
        committing = false;
      }
    },
  });
}
