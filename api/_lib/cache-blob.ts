import { get, put } from '@vercel/blob';
import type { CacheStore } from './cache.js';

const PATH_PREFIX = 'cache/';
const BLOB_CDN_MAX_AGE_SECONDS = 60;

function pathnameFor(key: string): string {
  return `${PATH_PREFIX}${key}.json`;
}

/** Vercel Blob backed store; one fixed pathname per key, overwritten on each write. */
export function createBlobStore(token: string): CacheStore {
  return {
    name: 'blob',
    async read<T>(key: string): Promise<T | null> {
      const result = await get(pathnameFor(key), { access: 'public', useCache: false, token });
      if (!result || result.statusCode !== 200) return null;
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as T;
    },
    async write<T>(key: string, value: T): Promise<void> {
      await put(pathnameFor(key), JSON.stringify(value), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: BLOB_CDN_MAX_AGE_SECONDS,
        token,
      });
    },
  };
}
