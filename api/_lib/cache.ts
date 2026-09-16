import { createBlobStore } from './cache-blob.js';
import { createMemoryStore } from './cache-memory.js';

export interface CacheStore {
  readonly name: 'blob' | 'memory';
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, value: T): Promise<void>;
}

const KEY_PATTERN = /^[a-z0-9-]+$/;

export function assertValidCacheKey(key: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new Error(`Invalid cache key "${key}": use lowercase letters, digits and hyphens only`);
  }
}

/** Blob store when BLOB_READ_WRITE_TOKEN is set, otherwise an in-process map (local dev). */
export function selectStore(env: NodeJS.ProcessEnv = process.env): CacheStore {
  return env.BLOB_READ_WRITE_TOKEN ? createBlobStore(env.BLOB_READ_WRITE_TOKEN) : createMemoryStore();
}

let defaultStore: CacheStore | null = null;

function getDefaultStore(): CacheStore {
  if (!defaultStore) defaultStore = selectStore();
  return defaultStore;
}

export function readCache<T>(key: string): Promise<T | null> {
  assertValidCacheKey(key);
  return getDefaultStore().read<T>(key);
}

export function writeCache<T>(key: string, value: T): Promise<void> {
  assertValidCacheKey(key);
  return getDefaultStore().write(key, value);
}

export function cacheBackendName(): CacheStore['name'] {
  return getDefaultStore().name;
}

export { createBlobStore, createMemoryStore };
