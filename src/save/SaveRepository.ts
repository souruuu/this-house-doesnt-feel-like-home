import type { FixtureSaveEnvelope } from './types.ts';
import type { FixtureProfile } from './profile.ts';

export type SaveSlot = 'autosave' | 'manual-1' | 'manual-2' | 'manual-3';
export const saveSlots: readonly SaveSlot[] = Object.freeze([
  'autosave',
  'manual-1',
  'manual-2',
  'manual-3',
]);

export type StoredRecord =
  | { readonly kind: 'empty'; readonly raw: null }
  | { readonly kind: 'corrupt'; readonly raw: string }
  | { readonly kind: 'data'; readonly raw: string; readonly value: unknown };

export function decodeRecord(raw: string | null): StoredRecord {
  if (raw === null) return Object.freeze({ kind: 'empty', raw });
  try {
    const value: unknown = JSON.parse(raw);
    return Object.freeze({ kind: 'data', raw, value });
  } catch {
    return Object.freeze({ kind: 'corrupt', raw });
  }
}

// A synchronous callback only: an async callback cannot return undefined.
// Every implementation MUST use this permit at its physical mutation boundary,
// after any awaits. Never retain/schedule the callback or mutate outside it.
export interface WritePermit {
  commit(write: () => undefined): void;
}

export interface GuardedWrite {
  readonly permit: WritePermit;
  readonly expectedRaw: string | null;
}

export interface SlotWrite extends GuardedWrite {
  readonly expectedProfileRaw: string;
}

// Untrusted records are classified/validated by the coordinator. Repositories
// own serialization, keys and synchronous compare/write, not story semantics.
export interface SaveRepository {
  save(
    slot: SaveSlot,
    data: FixtureSaveEnvelope,
    write: SlotWrite,
  ): Promise<void>;
  load(slot: SaveSlot): Promise<StoredRecord>;
  delete(slot: SaveSlot, write: SlotWrite): Promise<void>;
  loadProfile(): Promise<StoredRecord>;
  saveProfile(data: FixtureProfile, write: GuardedWrite): Promise<void>;
}
