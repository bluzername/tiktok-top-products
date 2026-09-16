import { describe, expect, it } from 'vitest';
import { normalizeProduct, normalizeProducts } from './normalize-product';

describe('normalizeProduct', () => {
  it('maps a full raw product', () => {
    const result = normalizeProduct(
      {
        url_title: 'wireless-ear-buds',
        cover_url: 'https://img/1.jpg',
        ctr: 0.4,
        cvr: 0.5,
        cpa: 2,
        post_change: 12,
        first_ecom_category: { id: '100', value: 'Electronics' },
        third_ecom_category: { id: '300', value: 'Earbuds' },
      },
      0
    );
    expect(result).toEqual({
      id: 'product-0',
      name: 'wireless ear buds',
      image: 'https://img/1.jpg',
      category: 'Earbuds',
      firstCategory: 'Electronics',
      firstCategoryId: '100',
      ctr: 0.4,
      cvr: 0.5,
      cpa: 2,
      popularityChange: 12,
      manufacturingScore: 0.1,
    });
  });

  it('falls back through name and image candidates', () => {
    expect(normalizeProduct({ product_name: 'a-b', image_url: 'u' }, 1).name).toBe('a b');
    expect(normalizeProduct({ name: 'c', image: 'i' }, 1)).toMatchObject({ name: 'c', image: 'i' });
    expect(normalizeProduct({}, 4)).toMatchObject({ name: 'Product 5', image: '' });
  });

  it('defaults metrics and categories when missing', () => {
    expect(normalizeProduct({ popularity_change: 3 }, 0)).toMatchObject({
      ctr: 0,
      cvr: 0,
      cpa: 0,
      popularityChange: 3,
      category: 'Unknown',
      firstCategory: 'Unknown',
      firstCategoryId: '',
      manufacturingScore: 0,
    });
  });

  it('prefers post_change over popularity_change', () => {
    expect(normalizeProduct({ post_change: 1, popularity_change: 2 }, 0).popularityChange).toBe(1);
  });
});

describe('normalizeProducts', () => {
  it('indexes products in order', () => {
    expect(normalizeProducts([{}, {}]).map(p => p.id)).toEqual(['product-0', 'product-1']);
  });
});
