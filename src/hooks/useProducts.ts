import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, SortState } from '@/types/product';
import type { Category } from '@/constants/categories';
import { ALL_CATEGORIES_ID } from '@/constants/categories';
import { fetchProducts } from '@/api/apify';
import { sortProducts } from '@/utils/sorting';

interface LoadedState {
  requestKey: string;
  products: Product[];
  fetchedAt: string | null;
  weekDate: string | null;
  error: string | null;
}

const EMPTY: Omit<LoadedState, 'requestKey'> = { products: [], fetchedAt: null, weekDate: null, error: null };

async function load(thailandMode: boolean, requestKey: string): Promise<LoadedState> {
  try {
    const payload = await fetchProducts(thailandMode);
    return { requestKey, products: payload.products, fetchedAt: payload.fetchedAt, weekDate: payload.weekDate, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to fetch products';
    return { ...EMPTY, requestKey, error };
  }
}

export function useProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [thailandMode, setThailandMode] = useState(true);
  const [requestId, setRequestId] = useState(0);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [sort, setSort] = useState<SortState>({
    field: 'manufacturingScore',
    direction: 'desc',
  });

  // Loading is derived: the current request key differs from the last completed one.
  const requestKey = `${thailandMode ? 'th' : 'global'}:${requestId}`;
  const loading = loaded?.requestKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    load(thailandMode, requestKey).then(next => {
      if (!cancelled) setLoaded(next);
    });
    return () => {
      cancelled = true;
    };
  }, [thailandMode, requestKey]);

  const refresh = useCallback(() => setRequestId(id => id + 1), []);

  const handleSort = useCallback((field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const products = loaded?.products ?? EMPTY.products;

  const categories: Category[] = useMemo(() => {
    const catMap = new Map<string, string>();
    for (const p of products) {
      if (p.firstCategoryId && !catMap.has(p.firstCategoryId)) {
        catMap.set(p.firstCategoryId, p.firstCategory);
      }
    }
    return Array.from(catMap.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_ID) return products;
    return products.filter(p => p.firstCategoryId === selectedCategory);
  }, [products, selectedCategory]);

  const sortedProducts = sortProducts(filteredProducts, sort.field, sort.direction);

  return {
    products: sortedProducts,
    fetchedAt: loaded?.fetchedAt ?? null,
    weekDate: loaded?.weekDate ?? null,
    loading,
    error: loaded?.error ?? null,
    categories,
    selectedCategory,
    setSelectedCategory,
    thailandMode,
    setThailandMode,
    sort,
    handleSort,
    refresh,
  };
}
