import type { Product, SortField, SortDirection } from '@/types/product';

export function sortProducts(
  products: Product[],
  field: SortField,
  direction: SortDirection
): Product[] {
  return [...products].sort((a, b) => {
    let aVal: string | number = a[field];
    let bVal: string | number = b[field];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return direction === 'asc' ? cmp : -cmp;
    }

    aVal = aVal as number;
    bVal = bVal as number;
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
}
