import type { Product, RawProduct } from './types.js';
import { calculateManufacturingScore } from './calculations.js';

const UNKNOWN_CATEGORY = 'Unknown';

export function normalizeProduct(raw: RawProduct, index: number): Product {
  const name = raw.url_title || raw.product_name || raw.name || `Product ${index + 1}`;
  const ctr = raw.ctr ?? 0;
  const cvr = raw.cvr ?? 0;
  const cpa = raw.cpa ?? 0;

  return {
    id: `product-${index}`,
    name: name.replace(/-/g, ' '),
    image: raw.cover_url || raw.image_url || raw.image || '',
    category: raw.third_ecom_category?.value || UNKNOWN_CATEGORY,
    firstCategory: raw.first_ecom_category?.value || UNKNOWN_CATEGORY,
    firstCategoryId: raw.first_ecom_category?.id || '',
    ctr,
    cvr,
    cpa,
    popularityChange: raw.post_change ?? raw.popularity_change ?? 0,
    manufacturingScore: calculateManufacturingScore(ctr, cvr, cpa),
  };
}

export function normalizeProducts(items: unknown[]): Product[] {
  return items.map((raw, index) => normalizeProduct(raw as RawProduct, index));
}
