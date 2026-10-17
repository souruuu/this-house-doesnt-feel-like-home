import type { Story } from 'inkjs';
import type { StoreApi } from 'zustand/vanilla';

// These facts are test inputs, never a production GameState or domain default.
export interface FixtureFacts {
  flags: Readonly<Record<string, boolean>>;
}

export interface NarrativeQueryPort {
  getFlag(id: string): boolean;
}

export function createNarrativeQueryPort(
  store: Pick<StoreApi<FixtureFacts>, 'getState'>,
): Readonly<NarrativeQueryPort> {
  return Object.freeze({
    getFlag(id: string) {
      const flags = store.getState().flags;
      if (!Object.hasOwn(flags, id))
        throw new Error(`Unknown query flag: ${id}`);
      return flags[id];
    },
  });
}

export function bindFixtureQueries(story: Story, queries: NarrativeQueryPort) {
  bindNarrativeQueries(story, queries, 'fixture_flag');
}

export function bindNarrativeQueries(
  story: Story,
  queries: NarrativeQueryPort,
  externalName: 'fixture_flag' | 'demo_flag',
) {
  story.BindExternalFunction(
    externalName,
    (id: unknown) => {
      if (typeof id !== 'string') throw new Error('Query ID must be a string');
      return queries.getFlag(id);
    },
    // Facts can change after the current output commits. Defer external reads
    // past newline lookahead; purity alone does not make them lookahead-safe.
    // Choice text/quoted strings must interpolate a just-evaluated Ink temp.
    false,
  );
}
