import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, SortState } from '@/types/product';
import type { Category } from '@/constants/categories';
import { ALL_CATEGORIES_ID } from '@/constants/categories';
import { fetchProducts } from '@/api/apify';
import { sortProducts } from '@/utils/sorting';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [thailandMode, setThailandMode] = useState(true);
  const [sort, setSort] = useState<SortState>({
    field: 'manufacturingScore',
    direction: 'desc',
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(thailandMode);
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [thailandMode]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSort = useCallback((field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

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
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    thailandMode,
    setThailandMode,
    sort,
    handleSort,
    refresh: loadProducts,
  };
}
