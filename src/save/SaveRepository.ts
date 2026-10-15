import type { FixtureSaveEnvelope } from './types.ts';

export type SaveSlot = 'autosave' | 'manual-1' | 'manual-2' | 'manual-3';

// No runtime implementation in Batch 3A. Untrusted reads must be validated by
// the coordinator; storage errors reject, never pretend to have saved.
export interface SaveRepository {
  save(slot: SaveSlot, data: FixtureSaveEnvelope): Promise<void>;
  load(slot: SaveSlot): Promise<unknown>;
  delete(slot: SaveSlot): Promise<void>;
}
