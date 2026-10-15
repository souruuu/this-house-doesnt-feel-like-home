import type { EventRegistry } from '../narrative/EventRegistry.ts';
import type { FixtureSession } from '../narrative/fixtureSession.ts';
import type { FixtureReferences } from '../narrative/types.ts';
import type { FixtureDomainState } from '../state/fixtureDomainStore.ts';
import type { FixtureProfileStore } from '../state/fixtureProfileStore.ts';
import {
  saveSlots,
  type SaveRepository,
  type SaveSlot,
  type StoredRecord,
  type WritePermit,
} from './SaveRepository.ts';
import type { SaveVersions } from './types.ts';
import { validateSaveEnvelope } from './validateSave.ts';
import { inspectSave } from './inspectSave.ts';
import { captureProfile, validateProfile } from './profile.ts';

export interface SaveOptions {
  // Explicit intention to replace another run; bound to the inspected bytes.
  readonly overwrite?: { readonly expectedRaw: string };
}

export class SaveWriteFailure extends Error {
  constructor(
    cause: unknown,
    readonly slotCommitted: boolean,
    readonly profileCommitted: boolean,
  ) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    this.name = 'SaveWriteFailure';
  }
}

interface Dependencies {
  readonly profile: FixtureProfileStore;
  readonly versions: SaveVersions;
  readonly references: FixtureReferences;
  readonly registry: EventRegistry;
  readonly createSession: (seed?: FixtureDomainState) => FixtureSession;
  // Still null in the dev panel: runtime wiring/startup is Batch 3B-2.
  readonly repository: SaveRepository | null;
}

export class SaveCoordinator {
  private current: Readonly<{ generation: number; session: FixtureSession }>;
  private readonly listeners = new Set<() => void>();
  private busy = false;
  private disposed = false;
  private operationToken: object | null = null;

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
      permit: WritePermit,
    ) => Promise<T> | T,
  ): Promise<T> {
    if (this.disposed || this.busy)
      throw new Error('Save/Load/New Run is busy or disposed');
    this.busy = true;
    const token = {};
    this.operationToken = token;
    let lease;
    try {
      const previous = this.current;
      previous.session.store.capture(); // Reject domain subscriber reentrancy.
      lease = previous.session.controller.holdForSessionOperation();
      const permit: WritePermit = Object.freeze({
        commit: (write: () => undefined) => {
          this.assertCurrent(previous);
          if (this.operationToken !== token)
            throw new Error('Stale write permit');
          write(); // Synchronous physical mutation; no notification or await.
        },
      });
      return await work(previous, lease, permit);
    } finally {
      lease?.release();
      if (this.operationToken === token) {
        this.operationToken = null;
        this.busy = false;
      }
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

  private inspectRecord(record: StoredRecord) {
    const { versions, profile, references, registry, createSession } =
      this.dependencies;
    const inspected = inspectSave(
      record,
      versions,
      profile.getState().profileId,
      references,
      registry,
    );
    if (inspected.status !== 'valid') return inspected;
    // An envelope can be valid while its opaque Ink cursor is not. Use the same
    // candidate-only public restore validation as Load before permitting overwrite.
    try {
      const candidate = createSession(inspected.envelope.game);
      try {
        candidate.controller.restoreCheckpoint(
          inspected.envelope.narrative,
          inspected.envelope.game.committedEventIds,
        );
      } finally {
        candidate.controller.dispose();
      }
      return inspected;
    } catch {
      return Object.freeze({ status: 'corrupt' as const, raw: inspected.raw });
    }
  }

  async inspect(slot: SaveSlot) {
    return this.operation(async (previous) => {
      if (!this.dependencies.repository)
        throw new Error('Save storage is not installed');
      const record = await this.dependencies.repository.load(slot);
      this.assertCurrent(previous);
      return this.inspectRecord(record);
    });
  }

  private async writeProfile(
    permit: WritePermit,
    onCommit: () => void,
    previous: typeof this.current,
  ) {
    const { repository, profile, references } = this.dependencies;
    if (!repository) throw new Error('Save storage is not installed');
    const stored = await repository.loadProfile();
    this.assertCurrent(previous);
    if (stored.kind === 'corrupt')
      throw new Error('Corrupt profile; writes blocked');
    if (stored.kind === 'empty') {
      const slots = await Promise.all(
        saveSlots.map((slot) => repository.load(slot)),
      );
      this.assertCurrent(previous);
      if (slots.some((record) => record.kind !== 'empty'))
        throw new Error(
          'Missing profile with existing save slots; writes blocked',
        );
    } else {
      const persisted = validateProfile(stored.value, references);
      if (persisted.profileId !== profile.getState().profileId)
        throw new Error('Stored profile identity mismatch; writes blocked');
      // Never replace a newer persisted read history with a stale hydrated subset.
      for (const id of persisted.readLineIds) profile.recordRead(id);
    }
    const snapshot = profile.getState();
    const data = captureProfile(profile, references);
    const profilePermit: WritePermit = Object.freeze({
      commit: (write: () => undefined) =>
        permit.commit(() => {
          if (profile.getState() !== snapshot)
            throw new Error('Stale profile snapshot');
          write();
          onCommit();
          return undefined;
        }),
    });
    await repository.saveProfile(data, {
      permit: profilePermit,
      expectedRaw: stored.raw,
    });
    return { data, raw: JSON.stringify(data) };
  }

  async persistProfile() {
    return this.operation(async (previous, _lease, permit) => {
      let profileCommitted = false;
      try {
        const { data } = await this.writeProfile(
          permit,
          () => {
            profileCommitted = true;
          },
          previous,
        );
        this.assertCurrent(previous);
        return data;
      } catch (error) {
        throw new SaveWriteFailure(error, false, profileCommitted);
      }
    });
  }

  async save(slot: SaveSlot, options: SaveOptions = {}) {
    return this.operation(async (previous, lease, permit) => {
      const { repository, versions, profile, references, registry } =
        this.dependencies;
      if (!repository) throw new Error('Save storage is not installed');
      let slotCommitted = false;
      let profileCommitted = false;
      try {
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
        const record = await repository.load(slot);
        this.assertCurrent(previous);
        const target = this.inspectRecord(record);
        if (target.status !== 'empty' && target.status !== 'valid')
          throw new Error(`Protected save slot: ${target.status}`);
        if (options.overwrite && options.overwrite.expectedRaw !== target.raw)
          throw new Error('Overwrite confirmation is stale');
        if (
          target.status === 'valid' &&
          target.envelope.game.runId !== envelope.game.runId &&
          options.overwrite?.expectedRaw !== target.raw
        )
          throw new Error(
            'Replacing a different run requires explicit overwrite confirmation',
          );
        const persisted = await this.writeProfile(
          permit,
          () => {
            profileCommitted = true;
          },
          previous,
        );
        this.assertCurrent(previous);
        const slotPermit: WritePermit = Object.freeze({
          commit: (write: () => undefined) =>
            permit.commit(() => {
              write();
              slotCommitted = true;
              return undefined;
            }),
        });
        await repository.save(slot, envelope, {
          permit: slotPermit,
          expectedRaw: target.raw,
          expectedProfileRaw: persisted.raw,
        });
        this.assertCurrent(previous);
        return envelope;
      } catch (error) {
        throw new SaveWriteFailure(error, slotCommitted, profileCommitted);
      }
    });
  }

  async load(slot: SaveSlot) {
    return this.operation(async (previous) => {
      const { repository, versions, profile, references, registry } =
        this.dependencies;
      if (!repository) throw new Error('Save storage is not installed');
      const record = await repository.load(slot);
      this.assertCurrent(previous);
      if (record.kind === 'empty') throw new Error('Save slot is empty');
      if (record.kind === 'corrupt') throw new Error('Corrupt save JSON');
      const envelope = validateSaveEnvelope(
        record.value,
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
    this.operationToken = null;
    this.listeners.clear();
    this.current.session.controller.dispose();
  }
}
