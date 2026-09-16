import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import { sortProducts } from '@/utils/sorting';

function product(overrides: Partial<Product>): Product {
  return {
    id: 'x',
    name: 'x',
    image: '',
    category: 'c',
    firstCategory: 'f',
    firstCategoryId: '1',
    ctr: 0,
    cvr: 0,
    cpa: 0,
    popularityChange: 0,
    manufacturingScore: 0,
    ...overrides,
  };
}

const products = [
  product({ id: 'a', name: 'banana', ctr: 0.3, manufacturingScore: 2 }),
  product({ id: 'b', name: 'apple', ctr: 0.1, manufacturingScore: 9 }),
  product({ id: 'c', name: 'cherry', ctr: 0.2, manufacturingScore: 5 }),
];

describe('sortProducts', () => {
  it('sorts numeric fields descending', () => {
    expect(sortProducts(products, 'ctr', 'desc').map(p => p.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts numeric fields ascending', () => {
    expect(sortProducts(products, 'manufacturingScore', 'asc').map(p => p.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts string fields with localeCompare', () => {
    expect(sortProducts(products, 'name', 'asc').map(p => p.name)).toEqual(['apple', 'banana', 'cherry']);
    expect(sortProducts(products, 'name', 'desc').map(p => p.name)).toEqual(['cherry', 'banana', 'apple']);
  });

  it('does not mutate the input array', () => {
    const before = products.map(p => p.id);
    sortProducts(products, 'ctr', 'asc');
    expect(products.map(p => p.id)).toEqual(before);
  });

  it('returns an empty array for empty input', () => {
    expect(sortProducts([], 'ctr', 'asc')).toEqual([]);
  });
});
