import axios from 'axios';
import type { RawProduct, Product } from '@/types/product';
import { calculateManufacturingScore } from '@/utils/calculations';

const APIFY_BASE_URL = 'https://api.apify.com/v2/acts/doliz~tiktok-creative-center-scraper/run-sync-get-dataset-items';

interface ApiResponse {
  list?: RawProduct[];
  pagination?: { page: number; size: number; total: number; has_more: boolean };
}

function normalizeProduct(raw: RawProduct, index: number): Product {
  const name = raw.url_title || raw.product_name || raw.name || `Product ${index + 1}`;
  const image = raw.cover_url || raw.image_url || raw.image || '';
  const ctr = raw.ctr ?? 0;
  const cvr = raw.cvr ?? 0;
  const cpa = raw.cpa ?? 0;
  const popularityChange = raw.post_change ?? raw.popularity_change ?? 0;
  const category = raw.third_ecom_category?.value || 'Unknown';
  const firstCategory = raw.first_ecom_category?.value || 'Unknown';
  const firstCategoryId = raw.first_ecom_category?.id || '';

  return {
    id: `product-${index}`,
    name: name.replace(/-/g, ' '),
    image,
    category,
    firstCategory,
    firstCategoryId,
    ctr,
    cvr,
    cpa,
    popularityChange,
    manufacturingScore: calculateManufacturingScore(ctr, cvr, cpa),
  };
}

function getWeekDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day - 7;
  const lastSunday = new Date(now.getFullYear(), now.getMonth(), diff);
  return lastSunday.toISOString().split('T')[0];
}

async function fetchViaServerless(thailandMode: boolean): Promise<ApiResponse> {
  const response = await axios.get<ApiResponse>('/api/products', {
    params: { thailand: thailandMode },
    timeout: 120000,
  });
  return response.data;
}

async function fetchViaApifyDirect(thailandMode: boolean): Promise<ApiResponse> {
  const token = import.meta.env.VITE_APIFY_TOKEN;
  const cookies = import.meta.env.VITE_TIKTOK_COOKIES;

  if (!token || !cookies) {
    throw new Error('API credentials not configured');
  }

  interface ApifyResponse {
    code: number;
    msg: string;
    data: ApiResponse | null;
  }

  const response = await axios.post<ApifyResponse[]>(
    `${APIFY_BASE_URL}?token=${token}`,
    {
      target: 'top_products',
      cookies,
      top_products_country: thailandMode ? 'TH' : '',
      top_products_level: 'l3',
      top_products_first_category: [],
      top_products_second_category: [],
      top_products_period_type: 'week',
      top_products_date: getWeekDate(),
      top_products_order_field: 'ctr',
      top_products_order_type: 'desc',
      top_products_page: 1,
      top_products_limit: 20,
    },
    { timeout: 120000 }
  );

  const result = response.data[0];
  if (!result?.data) {
    throw new Error(result?.msg || 'API returned an error');
  }
  return result.data;
}

export async function fetchProducts(thailandMode: boolean): Promise<Product[]> {
  const useServerless = import.meta.env.PROD || !import.meta.env.VITE_APIFY_TOKEN;

  const data = useServerless
    ? await fetchViaServerless(thailandMode)
    : await fetchViaApifyDirect(thailandMode);

  const items = data.list || [];
  return items.map((raw, index) => normalizeProduct(raw, index));
}
