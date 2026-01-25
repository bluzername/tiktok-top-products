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

export type SortField = 'name' | 'ctr' | 'cvr' | 'cpa' | 'popularityChange' | 'manufacturingScore';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}
