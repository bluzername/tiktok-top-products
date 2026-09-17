export interface EcomCategory {
  id: string;
  label?: string;
  value: string;
  parent_id?: string;
}

export interface RawProduct {
  url_title?: string;
  product_name?: string;
  name?: string;
  cover_url?: string | null;
  image_url?: string;
  image?: string;
  ctr?: number;
  cvr?: number;
  cpa?: number;
  post_change?: number;
  popularity_change?: number;
  cost?: number;
  impression?: number;
  post?: number;
  first_ecom_category?: EcomCategory;
  second_ecom_category?: EcomCategory;
  third_ecom_category?: EcomCategory;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  firstCategory: string;
  firstCategoryId: string;
  ctr: number;
  cvr: number;
  cpa: number;
  popularityChange: number;
  manufacturingScore: number;
}

export type Region = 'TH' | 'global';

/** Shape stored in the cache and returned by GET /api/products. */
export interface ProductsPayload {
  products: Product[];
  region: Region;
  /** Sunday (YYYY-MM-DD) the weekly TikTok data set is keyed on. */
  weekDate: string;
  /** ISO timestamp of when the data was pulled from Apify. */
  fetchedAt: string;
}

export function regionFor(thailandMode: boolean): Region {
  return thailandMode ? 'TH' : 'global';
}

export function cacheKeyFor(thailandMode: boolean): string {
  return thailandMode ? 'products-th' : 'products-global';
}
