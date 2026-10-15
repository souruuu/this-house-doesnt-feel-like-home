import type { SaveCoordinator } from '../save/SaveCoordinator.ts';
import { SaveWriteFailure } from '../save/SaveCoordinator.ts';
import {
  saveSlots,
  type SaveRepository,
  type SaveSlot,
} from '../save/SaveRepository.ts';
import type { SaveInspection } from '../save/inspectSave.ts';
import { validateProfile } from '../save/profile.ts';
import {
  createFixtureProfileStore,
  type FixtureProfileStore,
} from '../state/fixtureProfileStore.ts';
import type { FixtureSession } from './fixtureSession.ts';
import type {
  FixtureReferences,
  NarrativeRequest,
  NarrativeView,
} from './types.ts';

type SlotView =
  | SaveInspection
  | { readonly status: 'unverified'; readonly raw: string | null };
type Intent = Readonly<{
  kind: 'new-run' | 'save' | 'load';
  slot: SaveSlot;
  raw: string;
  autosaveRaw: string | null;
  sessionId: string | null;
}>;
interface RuntimeSnapshot {
  readonly phase:
    'checking' | 'awaiting-decision' | 'active' | 'blocked' | 'disposed';
  readonly busy: boolean;
  readonly session: FixtureSession | null;
  readonly slots: Readonly<Partial<Record<SaveSlot, SlotView>>>;
  readonly confirmation: Intent | null;
  readonly feedback: Readonly<{
    status: 'idle' | 'saved' | 'unsaved' | 'error';
    message: string;
  }>;
  readonly readLineIds: readonly string[];
}
interface Dependencies {
  readonly repository: SaveRepository;
  readonly references: FixtureReferences;
  readonly createCoordinator: (profile: FixtureProfileStore) => SaveCoordinator;
}

// Existing view/domain signals only. This policy never runs in a subscription.
export function isAutosaveBoundary(
  before: NarrativeView,
  after: NarrativeView,
  beforeLedger: readonly string[],
  afterLedger: readonly string[],
  chose = false,
) {
  return (
    (after.phase === 'line' || after.phase === 'choice') &&
    !!after.line &&
    (before.phase === 'idle' ||
      chose ||
      (after.phase === 'choice' && before.phase !== 'choice') ||
      before.presentation.sceneId !== after.presentation.sceneId ||
      beforeLedger.length !== afterLedger.length)
  );
}

// Fixture-specific UI command owner. Domain/Ink transactions and physical write
// authority remain in Controller/SaveCoordinator/SaveRepository respectively.
export class FixtureRuntime {
  private coordinator: SaveCoordinator | null = null;
  private profile: FixtureProfileStore | null = null;
  private initialization: Promise<void> | null = null;
  private readonly listeners = new Set<() => void>();
  private paused = false;
  private autoConsent: string | undefined;
  private snapshot: RuntimeSnapshot = Object.freeze({
    phase: 'checking',
    busy: true,
    session: null,
    slots: Object.freeze({}),
    confirmation: null,
    feedback: { status: 'idle' as const, message: 'กำลังตรวจข้อมูลบันทึก' },
    readLineIds: Object.freeze([]),
  });

  constructor(private readonly dependencies: Dependencies) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  private alive() {
    return this.snapshot.phase !== 'disposed';
  }
  private assertAlive() {
    if (!this.alive()) throw new Error('Runtime disposed');
  }
  private update(patch: Partial<RuntimeSnapshot>) {
    if (!this.alive()) return;
    this.snapshot = Object.freeze({ ...this.snapshot, ...patch });
    for (const listener of this.listeners) {
      // A UI notification cannot roll back an activated session or a write.
      try {
        listener();
      } catch {
        /* Other subscribers still receive the coherent snapshot. */
      }
    }
  }
  initialize() {
    this.initialization ??= this.inspectStartup();
    return this.initialization;
  }
  private async inspectStartup() {
    try {
      const repository = this.dependencies.repository;
      const reads = await Promise.allSettled([
        repository.loadProfile(),
        ...saveSlots.map((slot) => repository.load(slot)),
      ]);
      this.assertAlive();
      const slots: Partial<Record<SaveSlot, SlotView>> = {};
      for (const [i, slot] of saveSlots.entries()) {
        const read = reads[i + 1];
        if (read.status === 'fulfilled')
          slots[slot] = {
            status: 'unverified',
            raw: read.value.raw,
          };
      }
      this.update({ slots: Object.freeze({ ...slots }) });
      const failure = reads.find((read) => read.status === 'rejected');
      if (failure?.status === 'rejected') throw failure.reason;
      const profileRead = reads[0];
      if (profileRead.status !== 'fulfilled')
        throw new Error('Profile unavailable');
      const record = profileRead.value;
      if (record.kind === 'corrupt') throw new Error('ข้อมูลผู้เล่นเสียหาย');
      if (record.kind === 'empty') {
        if (saveSlots.some((slot) => slots[slot]?.raw !== null))
          throw new Error('ไม่พบข้อมูลผู้เล่น แต่ยังมีช่องบันทึกเดิม');
        this.profile = createFixtureProfileStore();
      } else {
        const data = validateProfile(
          record.value,
          this.dependencies.references,
        );
        this.profile = createFixtureProfileStore(
          data.profileId,
          data.readLineIds,
        );
      }
      this.coordinator = this.dependencies.createCoordinator(this.profile);
      this.coordinator.getSnapshot().session.controller.setPaused(this.paused);
      for (const slot of saveSlots) {
        slots[slot] = await this.coordinator.inspect(slot);
        this.assertAlive();
      }
      if ((await repository.loadProfile()).raw !== record.raw)
        throw new Error('ข้อมูลผู้เล่นเปลี่ยนระหว่างเริ่มต้น');
      this.assertAlive();
      this.update({
        slots: Object.freeze(slots),
        readLineIds: this.profile.getState().readLineIds,
      });
      const auto = slots.autosave;
      if (auto?.status !== 'empty' && auto?.status !== 'valid')
        throw new Error('Autosave ถูกป้องกัน: ' + auto?.status);
      this.update({
        phase: 'awaiting-decision',
        busy: false,
        feedback: {
          status: 'idle',
          message: 'เลือกเล่นต่อหรือเริ่มรอบทดสอบใหม่',
        },
      });
    } catch (error) {
      this.update({
        phase: 'blocked',
        busy: false,
        feedback: { status: 'error', message: this.message(error) },
      });
    }
  }
  private message(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
  private owner() {
    this.assertAlive();
    if (!this.coordinator || !this.profile)
      throw new Error('Runtime not initialized');
    return this.coordinator;
  }
  private async perform(
    work: () => Promise<void | boolean>,
    confirming = false,
  ) {
    if (
      !['active', 'awaiting-decision'].includes(this.snapshot.phase) ||
      this.snapshot.busy ||
      (this.snapshot.confirmation && !confirming)
    )
      return false;
    this.update({ busy: true });
    try {
      const accepted = await work();
      this.assertAlive();
      return accepted !== false;
    } catch (error) {
      const committed =
        error instanceof SaveWriteFailure && error.slotCommitted;
      this.update({
        feedback: {
          status: 'error',
          message: committed
            ? 'เขียนช่องบันทึกแล้ว แต่ขั้นตอนตอบกลับล้มเหลว: ' +
              this.message(error)
            : 'ยังไม่ได้บันทึกความคืบหน้าล่าสุด: ' + this.message(error),
        },
      });
      return false;
    } finally {
      this.update({
        busy: false,
        readLineIds: this.profile?.getState().readLineIds ?? [],
      });
    }
  }
  private async inspectSlot(slot: SaveSlot) {
    const inspected = await this.owner().inspect(slot);
    this.assertAlive();
    this.update({
      slots: Object.freeze({ ...this.snapshot.slots, [slot]: inspected }),
    });
    return inspected;
  }
  private async checkProfile() {
    const read = await this.dependencies.repository.loadProfile();
    this.assertAlive();
    if (read.kind === 'empty') {
      // Fresh bootstrap only; the physical-write boundary checks all slots again.
      for (const slot of saveSlots) {
        if ((await this.dependencies.repository.load(slot)).kind !== 'empty')
          throw new Error('Missing profile with existing save slots');
        this.assertAlive();
      }
      return;
    }
    if (read.kind !== 'data') throw new Error('Corrupt profile');
    const data = validateProfile(read.value, this.dependencies.references);
    if (data.profileId !== this.profile?.getState().profileId)
      throw new Error('Profile identity changed');
    for (const id of data.readLineIds) this.profile.recordRead(id);
  }
  inspect() {
    return this.perform(async () => {
      for (const slot of saveSlots) await this.inspectSlot(slot);
    });
  }
  setEnvironment(paused: boolean) {
    this.paused = paused;
    this.coordinator?.getSnapshot().session.controller.setPaused(paused);
    if (
      !paused &&
      this.snapshot.phase === 'active' &&
      this.snapshot.session?.controller.getSnapshot().phase === 'idle'
    )
      return this.command('start');
    return Promise.resolve(false);
  }
  private syncSession() {
    this.update({
      phase: 'active',
      session: this.owner().getSnapshot().session,
    });
  }
  private safeSlot(inspected: SaveInspection) {
    if (inspected.status !== 'empty' && inspected.status !== 'valid')
      throw new Error('Protected save slot: ' + inspected.status);
  }
  private propose(intent: Intent) {
    this.update({ confirmation: Object.freeze(intent) });
  }
  cancel() {
    if (!this.snapshot.busy) this.update({ confirmation: null });
  }
  newRun() {
    return this.perform(async () => {
      await this.checkProfile();
      const auto = await this.inspectSlot('autosave');
      this.safeSlot(auto);
      if (auto.status === 'valid')
        this.propose({
          kind: 'new-run',
          slot: 'autosave',
          raw: auto.raw,
          autosaveRaw: auto.raw,
          sessionId:
            this.snapshot.session?.controller.getSnapshot().sessionId ?? null,
        });
      else await this.startNewRun();
    });
  }
  private async startNewRun(consent?: string) {
    const receipt = await this.owner().newRun();
    this.assertAlive();
    this.autoConsent = consent;
    this.syncSession();
    if (receipt.notificationError) throw new Error(receipt.notificationError);
    if (!this.paused) await this.advance('start');
  }
  resume() {
    return this.perform(async () => {
      const selected = this.snapshot.slots.autosave;
      if (selected?.status !== 'valid') throw new Error('No valid autosave');
      await this.restore('autosave', selected.raw);
    });
  }
  manualSave(slot: Exclude<SaveSlot, 'autosave'>) {
    return this.perform(async () => {
      if (this.snapshot.phase !== 'active') throw new Error('No active run');
      const selected = await this.inspectSlot(slot);
      this.safeSlot(selected);
      if (selected.status === 'valid')
        this.propose({
          kind: 'save',
          slot,
          raw: selected.raw,
          autosaveRaw: null,
          sessionId: this.snapshot.session!.controller.getSnapshot().sessionId,
        });
      else await this.write(slot, undefined, null);
    });
  }
  manualLoad(slot: Exclude<SaveSlot, 'autosave'>) {
    return this.perform(async () => {
      const selected = this.snapshot.slots[slot];
      if (selected?.status !== 'valid')
        throw new Error('Selected slot is not valid');
      const auto = await this.inspectSlot('autosave');
      this.safeSlot(auto);
      if (
        auto.status === 'valid' &&
        auto.envelope.game.runId !== selected.envelope.game.runId
      )
        this.propose({
          kind: 'load',
          slot,
          raw: selected.raw,
          autosaveRaw: auto.raw,
          sessionId:
            this.snapshot.session?.controller.getSnapshot().sessionId ?? null,
        });
      else await this.restore(slot, selected.raw);
    });
  }
  confirm() {
    const intent = this.snapshot.confirmation;
    if (!intent) return Promise.resolve(false);
    return this.perform(async () => {
      this.update({ confirmation: null });
      if (
        intent.sessionId !==
        (this.snapshot.session?.controller.getSnapshot().sessionId ?? null)
      )
        throw new Error('Stale confirmation session');
      await this.checkProfile();
      const slot = await this.inspectSlot(intent.slot);
      if (slot.raw !== intent.raw)
        throw new Error('Overwrite confirmation is stale');
      if (intent.kind === 'new-run') await this.startNewRun(intent.raw);
      if (intent.kind === 'save') await this.write(intent.slot, intent.raw);
      if (intent.kind === 'load') {
        const auto = await this.inspectSlot('autosave');
        if (auto.raw !== intent.autosaveRaw)
          throw new Error('Autosave confirmation is stale');
        await this.restore(
          intent.slot,
          intent.raw,
          intent.autosaveRaw ?? undefined,
        );
      }
    }, true);
  }
  private async restore(slot: SaveSlot, raw: string, consent?: string) {
    await this.checkProfile();
    const receipt = await this.owner().load(slot, { expectedRaw: raw });
    this.assertAlive();
    this.autoConsent = consent;
    this.syncSession();
    this.update({
      feedback: {
        status: 'idle',
        message: 'โหลดจุดบันทึกแล้ว — ยังไม่มีการบันทึกใหม่',
      },
    });
    if (receipt.notificationError) throw new Error(receipt.notificationError);
  }
  private async write(
    slot: SaveSlot,
    consent?: string,
    expectedRaw?: string | null,
  ) {
    const saved = await this.owner().save(slot, {
      expectedRaw,
      ...(consent === undefined ? {} : { overwrite: { expectedRaw: consent } }),
    });
    this.assertAlive();
    if (slot === 'autosave') this.autoConsent = undefined;
    this.update({
      slots: Object.freeze({
        ...this.snapshot.slots,
        [slot]: Object.freeze({
          status: 'valid',
          raw: JSON.stringify(saved),
          envelope: saved,
        }),
      }),
      feedback: {
        status: 'saved',
        message: `บันทึก ${slot}: ${saved.narrative.checkpoint.line.id} แล้ว`,
      },
    });
  }
  retrySave() {
    return this.perform(() => this.write('autosave', this.autoConsent));
  }
  continue(request: NarrativeRequest) {
    return this.command('continue', request);
  }
  choose(request: NarrativeRequest, index: number) {
    return this.command('choose', request, index);
  }
  private command(
    kind: 'start' | 'continue' | 'choose',
    request?: NarrativeRequest,
    index?: number,
  ) {
    if (this.snapshot.phase !== 'active' || this.paused)
      return Promise.resolve(false);
    return this.perform(() => this.advance(kind, request, index));
  }
  private async advance(
    kind: 'start' | 'continue' | 'choose',
    request?: NarrativeRequest,
    index?: number,
  ) {
    const session = this.owner().getSnapshot().session;
    const before = session.controller.getSnapshot();
    const ledger = session.store.getState().committedEventIds;
    const history = this.profile!.getState();
    const accepted =
      kind === 'start'
        ? session.controller.start()
        : kind === 'continue'
          ? !!request && session.controller.continue(request)
          : !!request &&
            index !== undefined &&
            session.controller.choose(request, index);
    if (!accepted) {
      const failed = session.controller.getSnapshot();
      if (failed.phase === 'error')
        this.update({
          feedback: {
            status: 'error',
            message: failed.error ?? 'Narrative failed',
          },
        });
      return false;
    }
    // An environment change during Controller publish is deferred by its lock.
    // Apply it after command completion so pause revisions still reject old input.
    session.controller.setPaused(this.paused);
    const after = session.controller.getSnapshot();
    this.update({
      feedback: {
        status: 'unsaved',
        message: 'ความคืบหน้าล่าสุดยังไม่ได้บันทึก',
      },
    });
    if (
      isAutosaveBoundary(
        before,
        after,
        ledger,
        session.store.getState().committedEventIds,
        kind === 'choose',
      )
    )
      await this.write('autosave', this.autoConsent);
    else if (this.profile!.getState() !== history)
      await this.owner().persistProfile();
    return true;
  }
  dispose() {
    if (!this.alive()) return;
    this.coordinator?.dispose();
    this.snapshot = Object.freeze({
      ...this.snapshot,
      phase: 'disposed',
      busy: false,
      confirmation: null,
    });
    this.listeners.clear();
  }
}
