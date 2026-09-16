export type { EcomCategory, RawProduct, Product, ProductsPayload, Region } from '../../shared/types';

export type SortField = 'name' | 'ctr' | 'cvr' | 'cpa' | 'popularityChange' | 'manufacturingScore';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}
