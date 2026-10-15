import type { EventRegistry } from '../narrative/EventRegistry.ts';
import type { FixtureSession } from '../narrative/fixtureSession.ts';
import type { FixtureReferences } from '../narrative/types.ts';
import type { FixtureDomainState } from '../state/fixtureDomainStore.ts';
import type { FixtureProfileStore } from '../state/fixtureProfileStore.ts';
import type { SaveRepository, SaveSlot } from './SaveRepository.ts';
import type { SaveVersions } from './types.ts';
import { validateSaveEnvelope } from './validateSave.ts';

interface Dependencies {
  readonly profile: FixtureProfileStore;
  readonly versions: SaveVersions;
  readonly references: FixtureReferences;
  readonly registry: EventRegistry;
  readonly createSession: (seed?: FixtureDomainState) => FixtureSession;
  // Null in the dev panel until Batch 3B. Only tests supply an in-memory fake.
  readonly repository: SaveRepository | null;
}

export class SaveCoordinator {
  private current: Readonly<{ generation: number; session: FixtureSession }>;
  private readonly listeners = new Set<() => void>();
  private busy = false;
  private disposed = false;

  constructor(private readonly dependencies: Dependencies) {
    this.current = Object.freeze({
      generation: 0,
      session: dependencies.createSession(),
    });
  }

  getSnapshot = () => this.current;

  subscribe = (listener: () => void) => {
    if (this.disposed) throw new Error('Save coordinator is disposed');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private async operation<T>(
    work: (
      previous: typeof this.current,
      lease: ReturnType<
        FixtureSession['controller']['holdForSessionOperation']
      >,
    ) => Promise<T> | T,
  ): Promise<T> {
    if (this.disposed || this.busy)
      throw new Error('Save/Load/New Run is busy or disposed');
    this.busy = true;
    let lease;
    try {
      const previous = this.current;
      previous.session.store.capture(); // Reject domain subscriber reentrancy.
      lease = previous.session.controller.holdForSessionOperation();
      return await work(previous, lease);
    } finally {
      lease?.release();
      this.busy = false;
    }
  }

  private assertCurrent(previous: typeof this.current) {
    if (this.disposed || this.current !== previous)
      throw new Error('Stale session operation');
  }

  private activate(previous: typeof this.current, candidate: FixtureSession) {
    this.assertCurrent(previous);
    const candidateLease = candidate.controller.holdForSessionOperation();
    // A single pointer owns store + controller. No half-restored live store.
    this.current = Object.freeze({
      generation: previous.generation + 1,
      session: candidate,
    });
    const paused = previous.session.controller.getSnapshot().paused;
    previous.session.controller.dispose();
    try {
      let notificationError = candidate.controller.setPaused(paused);
      for (const listener of this.listeners) {
        try {
          listener();
        } catch (error) {
          notificationError ??=
            error instanceof Error ? error.message : String(error);
        }
      }
      // Notification failure is after activation, never a reason to roll back.
      return { notificationError };
    } finally {
      candidateLease.release();
    }
  }

  async save(slot: SaveSlot) {
    return this.operation(async (previous, lease) => {
      const { repository, versions, profile, references, registry } =
        this.dependencies;
      if (!repository) throw new Error('Save storage is not installed');
      const captured = lease.capture(() => previous.session.store.capture());
      const envelope = validateSaveEnvelope(
        {
          ...versions,
          scope: 'technical-fixture-only',
          profileId: profile.getState().profileId,
          timestamp: Date.now(),
          ...captured,
        },
        versions,
        profile.getState().profileId,
        references,
        registry,
      );
      await repository.save(slot, envelope);
      this.assertCurrent(previous);
      return envelope;
    });
  }

  async load(slot: SaveSlot) {
    return this.operation(async (previous) => {
      const { repository, versions, profile, references, registry } =
        this.dependencies;
      if (!repository) throw new Error('Save storage is not installed');
      const input = await repository.load(slot);
      this.assertCurrent(previous);
      if (input === null) throw new Error('Save slot is empty');
      const envelope = validateSaveEnvelope(
        input,
        versions,
        profile.getState().profileId,
        references,
        registry,
      );
      const candidate = this.dependencies.createSession(envelope.game);
      let activated = false;
      try {
        candidate.controller.restoreCheckpoint(
          envelope.narrative,
          envelope.game.committedEventIds,
        );
        this.assertCurrent(previous);
        const result = this.activate(previous, candidate);
        activated = true;
        return result;
      } finally {
        if (!activated) candidate.controller.dispose();
      }
    });
  }

  async newRun() {
    return this.operation((previous) => {
      const candidate = this.dependencies.createSession();
      try {
        return this.activate(previous, candidate);
      } catch (error) {
        candidate.controller.dispose();
        throw error;
      }
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    this.current.session.controller.dispose();
  }
}
