import type { CacheStore } from './cache.js';

/**
 * In-process cache used when no blob token is configured. Survives only for the
 * lifetime of the process, so on Vercel every cold start begins empty.
 */
export function createMemoryStore(): CacheStore {
  const entries = new Map<string, string>();
  return {
    name: 'memory',
    async read<T>(key: string): Promise<T | null> {
      const raw = entries.get(key);
      return raw === undefined ? null : (JSON.parse(raw) as T);
    },
    async write<T>(key: string, value: T): Promise<void> {
      entries.set(key, JSON.stringify(value));
    },
  };
}
