import {
  decodeRecord,
  saveSlots,
  type GuardedWrite,
  type SaveRepository,
  type SaveSlot,
  type SlotWrite,
} from './SaveRepository.ts';
import type { FixtureProfile } from './profile.ts';
import type { FixtureSaveEnvelope } from './types.ts';

export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
// Stable across builds/schemas so unsupported records remain visible. QA only.
export const fixtureStorageKeys = Object.freeze({
  profile: 'this-house:technical-fixture:profile',
  slots: Object.freeze({
    autosave: 'this-house:technical-fixture:slot:autosave',
    'manual-1': 'this-house:technical-fixture:slot:manual-1',
    'manual-2': 'this-house:technical-fixture:slot:manual-2',
    'manual-3': 'this-house:technical-fixture:slot:manual-3',
  }),
});

function assertExpected(actual: string | null, expected: string | null) {
  if (actual !== expected)
    throw new Error('Stored contents changed before write');
}

export class LocalStorageSaveRepository implements SaveRepository {
  // Defer the getter too: accessing window.localStorage can throw SecurityError.
  constructor(
    private readonly storage: () => StoragePort = () => window.localStorage,
  ) {}

  async load(slot: SaveSlot) {
    return decodeRecord(this.storage().getItem(fixtureStorageKeys.slots[slot]));
  }
  async loadProfile() {
    return decodeRecord(this.storage().getItem(fixtureStorageKeys.profile));
  }
  async save(slot: SaveSlot, data: FixtureSaveEnvelope, write: SlotWrite) {
    const raw = JSON.stringify(data);
    write.permit.commit(() => {
      const storage = this.storage();
      const key = fixtureStorageKeys.slots[slot];
      assertExpected(
        storage.getItem(fixtureStorageKeys.profile),
        write.expectedProfileRaw,
      );
      assertExpected(storage.getItem(key), write.expectedRaw);
      storage.setItem(key, raw);
      return undefined;
    });
  }
  async saveProfile(data: FixtureProfile, write: GuardedWrite) {
    const raw = JSON.stringify(data);
    write.permit.commit(() => {
      const storage = this.storage();
      const previous = storage.getItem(fixtureStorageKeys.profile);
      assertExpected(previous, write.expectedRaw);
      if (
        previous === null &&
        saveSlots.some(
          (slot) => storage.getItem(fixtureStorageKeys.slots[slot]) !== null,
        )
      )
        throw new Error(
          'Missing profile with existing save slots; writes blocked',
        );
      if (previous !== raw) storage.setItem(fixtureStorageKeys.profile, raw);
      return undefined;
    });
  }
  async delete(slot: SaveSlot, write: SlotWrite) {
    write.permit.commit(() => {
      const storage = this.storage();
      const key = fixtureStorageKeys.slots[slot];
      assertExpected(
        storage.getItem(fixtureStorageKeys.profile),
        write.expectedProfileRaw,
      );
      assertExpected(storage.getItem(key), write.expectedRaw);
      storage.removeItem(key);
      return undefined;
    });
  }
}
