import { describe, expect, it } from 'vitest';
import { assertValidCacheKey, createMemoryStore, selectStore } from './cache';

describe('memory cache store', () => {
  it('returns null for a missing key', async () => {
    const store = createMemoryStore();
    expect(await store.read('products-th')).toBeNull();
  });

  it('round-trips a value and overwrites on a second write', async () => {
    const store = createMemoryStore();
    await store.write('k', { a: 1 });
    expect(await store.read('k')).toEqual({ a: 1 });
    await store.write('k', { a: 2 });
    expect(await store.read('k')).toEqual({ a: 2 });
  });

  it('stores a copy, not a reference', async () => {
    const store = createMemoryStore();
    const value = { items: [1] };
    await store.write('k', value);
    value.items.push(2);
    expect(await store.read<typeof value>('k')).toEqual({ items: [1] });
  });

  it('isolates stores from each other', async () => {
    const a = createMemoryStore();
    const b = createMemoryStore();
    await a.write('k', 1);
    expect(await b.read('k')).toBeNull();
  });
});

describe('selectStore', () => {
  it('uses memory when BLOB_READ_WRITE_TOKEN is absent', () => {
    expect(selectStore({}).name).toBe('memory');
  });

  it('uses blob when BLOB_READ_WRITE_TOKEN is set', () => {
    expect(selectStore({ BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_test' }).name).toBe('blob');
  });
});

describe('assertValidCacheKey', () => {
  it('accepts lowercase, digits and hyphens', () => {
    expect(() => assertValidCacheKey('products-th')).not.toThrow();
  });

  it('rejects path-like keys', () => {
    expect(() => assertValidCacheKey('../etc')).toThrow(/Invalid cache key/);
    expect(() => assertValidCacheKey('Products')).toThrow(/Invalid cache key/);
  });
});
