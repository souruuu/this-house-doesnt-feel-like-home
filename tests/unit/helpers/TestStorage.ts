import type { StoragePort } from '../../../src/save/LocalStorageSaveRepository.ts';

// Injectable Storage surface, including native-style failures before mutation.
// Tests assert raw strings in this map, not just calls to a repository mock.
export class TestStorage implements StoragePort {
  readonly bytes = new Map<string, string>();
  readonly writes: string[] = [];
  beforeSet: ((key: string) => void) | null = null;
  getItem(key: string) {
    return this.bytes.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.beforeSet?.(key);
    this.bytes.set(key, value);
    this.writes.push(key);
  }
  removeItem(key: string) {
    this.bytes.delete(key);
  }
}
