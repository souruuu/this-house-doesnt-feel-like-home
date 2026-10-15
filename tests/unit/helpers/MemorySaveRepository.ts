import type {
  SaveRepository,
  SaveSlot,
} from '../../../src/save/SaveRepository.ts';
import type { FixtureSaveEnvelope } from '../../../src/save/types.ts';

// Test fake only: accepts corrupt/unsupported records for validation tests.
export class MemorySaveRepository implements SaveRepository {
  readonly slots = new Map<SaveSlot, unknown>();
  beforeSave: (() => Promise<void>) | null = null;
  beforeLoad: (() => Promise<void>) | null = null;
  async save(slot: SaveSlot, data: FixtureSaveEnvelope) {
    await this.beforeSave?.();
    this.slots.set(slot, structuredClone(data));
  }
  async load(slot: SaveSlot): Promise<unknown> {
    await this.beforeLoad?.();
    return structuredClone(this.slots.get(slot) ?? null);
  }
  async delete(slot: SaveSlot) {
    this.slots.delete(slot);
  }
}
