import { createStore } from 'zustand/vanilla';
import type { DomainEvent, FixtureDomainPort } from '../narrative/types.ts';

export interface FixtureDomainState {
  readonly runId: string;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly selectedBranch: 'a' | 'b' | null;
  readonly effectCount: number;
  readonly committedEventIds: readonly string[];
}

export function initialFixtureState(branchEnabled = true): FixtureDomainState {
  return Object.freeze({
    runId: crypto.randomUUID(),
    flags: Object.freeze({
      'fixture.branch_enabled': branchEnabled,
      'fixture.branch_committed': false,
      'fixture.branch_pending': true,
    }),
    selectedBranch: null,
    effectCount: 0,
    committedEventIds: Object.freeze([]),
  });
}

// Pure preparation is shared by live commits and bounded tooling traversal.
// Every precondition is checked against the candidate, never a half-written store.
export function prepareFixtureCommit(
  previous: FixtureDomainState,
  events: readonly Readonly<DomainEvent>[],
): FixtureDomainState {
  let selectedBranch = previous.selectedBranch;
  let effectCount = previous.effectCount;
  const ids = new Set(previous.committedEventIds);
  for (const event of events) {
    if (ids.has(event.id)) continue;
    switch (event.action.kind) {
      case 'select-branch':
        if (selectedBranch !== null)
          throw new Error('Fixture branch already selected');
        selectedBranch = event.action.branch;
        break;
      case 'record-rejoin':
        if (selectedBranch === null)
          throw new Error('Fixture rejoin requires a selected branch');
        break;
      default:
        throw new Error('Unknown fixture domain action');
    }
    ids.add(event.id);
    effectCount++;
  }
  if (ids.size === previous.committedEventIds.length) return previous;
  return Object.freeze({
    ...previous,
    flags: Object.freeze({
      ...previous.flags,
      'fixture.branch_committed': selectedBranch !== null,
      'fixture.branch_pending': selectedBranch === null,
    }),
    selectedBranch,
    effectCount,
    committedEventIds: Object.freeze([...ids]),
  });
}

export function createFixtureDomainStore(seed = initialFixtureState()) {
  const store = createStore<FixtureDomainState>(() =>
    Object.freeze({
      ...seed,
      flags: Object.freeze({ ...seed.flags }),
      committedEventIds: Object.freeze([...seed.committedEventIds]),
    }),
  );
  let committing = false;
  const port: FixtureDomainPort = {
    commit(events) {
      if (committing) throw new Error('Fixture domain commit is locked');
      committing = true;
      try {
        const previous = store.getState();
        const next = prepareFixtureCommit(previous, events);
        if (next === previous) return { notificationError: null };
        try {
          // Zustand replaces state before notifying subscribers. One update
          // publishes effects and ledger together, even if a subscriber throws.
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
  };
  // No raw setState is exposed to UI, Ink, or presentation callbacks.
  return Object.freeze({
    getState: store.getState,
    subscribe: store.subscribe,
    commit: port.commit,
    capture() {
      if (committing) throw new Error('Fixture domain commit is locked');
      return store.getState();
    },
  });
}

export type FixtureDomainStore = ReturnType<typeof createFixtureDomainStore>;
