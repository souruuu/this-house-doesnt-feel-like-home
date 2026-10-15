import {
  decodeRecord,
  type GuardedWrite,
  type SaveRepository,
  type SaveSlot,
  type SlotWrite,
} from '../../../src/save/SaveRepository.ts';
import type { FixtureSaveEnvelope } from '../../../src/save/types.ts';
import type { FixtureProfile } from '../../../src/save/profile.ts';

// Test fake only: accepts corrupt/unsupported records for validation tests.
export class MemorySaveRepository implements SaveRepository {
  readonly slots = new Map<SaveSlot, unknown>();
  beforeSave: (() => Promise<void>) | null = null;
  beforeLoad: (() => Promise<void>) | null = null;
  beforeProfileSave: (() => Promise<void>) | null = null;
  afterSave: (() => Promise<void>) | null = null;
  profile: unknown = null;
  private raw(value: unknown) {
    return value === null ? null : JSON.stringify(value);
  }
  private check(actual: string | null, expected: string | null) {
    if (actual !== expected)
      throw new Error('Stored contents changed before write');
  }
  async save(slot: SaveSlot, data: FixtureSaveEnvelope, write: SlotWrite) {
    await this.beforeSave?.();
    write.permit.commit(() => {
      this.check(this.raw(this.profile), write.expectedProfileRaw);
      this.check(this.raw(this.slots.get(slot) ?? null), write.expectedRaw);
      this.slots.set(slot, structuredClone(data));
      return undefined;
    });
    await this.afterSave?.();
  }
  async load(slot: SaveSlot) {
    await this.beforeLoad?.();
    return decodeRecord(this.raw(this.slots.get(slot) ?? null));
  }
  async delete(slot: SaveSlot, write: SlotWrite) {
    write.permit.commit(() => {
      this.check(this.raw(this.profile), write.expectedProfileRaw);
      this.check(this.raw(this.slots.get(slot) ?? null), write.expectedRaw);
      this.slots.delete(slot);
      return undefined;
    });
  }
  async loadProfile() {
    return decodeRecord(this.raw(this.profile));
  }
  async saveProfile(data: FixtureProfile, write: GuardedWrite) {
    await this.beforeProfileSave?.();
    write.permit.commit(() => {
      this.check(this.raw(this.profile), write.expectedRaw);
      if (this.profile === null && this.slots.size > 0)
        throw new Error(
          'Missing profile with existing save slots; writes blocked',
        );
      this.profile = structuredClone(data);
      return undefined;
    });
  }
}
