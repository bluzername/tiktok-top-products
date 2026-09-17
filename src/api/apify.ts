import axios from 'axios';
import type { ProductsPayload } from '@/types/product';
import {
  buildApifyRequestBody,
  buildApifyRunSyncUrl,
  extractProductList,
  DEFAULT_APIFY_ACTOR_ID,
  type ApifyActorResult,
} from '../../shared/apify-request';
import { normalizeProducts } from '../../shared/normalize-product';
import { getWeekDate } from '../../shared/week-date';
import { regionFor } from '../../shared/types';

const APIFY_TIMEOUT_MS = 120_000;

interface ApiErrorBody {
  error?: string;
  hint?: string;
  details?: string;
}

function describeApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error) && error.response?.data?.error) {
    const { error: message, hint } = error.response.data;
    return hint ? `${message}. ${hint}` : message;
  }
  return error instanceof Error ? error.message : 'Failed to fetch products';
}

/** Production path: the Vercel function serves the cached weekly snapshot. Never hits Apify from the browser. */
async function fetchViaServerless(thailandMode: boolean): Promise<ProductsPayload> {
  try {
    const response = await axios.get<ProductsPayload>('/api/products', {
      params: { thailand: thailandMode },
      timeout: APIFY_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    throw new Error(describeApiError(error));
  }
}

/** Local-only path: calls Apify directly with VITE_APIFY_TOKEN. Each call is a paid actor run. */
async function fetchViaApifyDirect(thailandMode: boolean): Promise<ProductsPayload> {
  const token = import.meta.env.VITE_APIFY_TOKEN;
  const cookies = import.meta.env.VITE_TIKTOK_COOKIES;
  if (!token || !cookies) {
    throw new Error('Set VITE_APIFY_TOKEN and VITE_TIKTOK_COOKIES in .env for direct mode');
  }

  const weekDate = getWeekDate();
  const actorId = import.meta.env.VITE_APIFY_ACTOR_ID || DEFAULT_APIFY_ACTOR_ID;
  const response = await axios.post<ApifyActorResult[]>(
    buildApifyRunSyncUrl(actorId, token),
    buildApifyRequestBody({ cookies, thailandMode, weekDate }),
    { timeout: APIFY_TIMEOUT_MS }
  );

  return {
    products: normalizeProducts(extractProductList(response.data)),
    region: regionFor(thailandMode),
    weekDate,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchProducts(thailandMode: boolean): Promise<ProductsPayload> {
  const useServerless = import.meta.env.PROD || !import.meta.env.VITE_APIFY_TOKEN;
  return useServerless ? fetchViaServerless(thailandMode) : fetchViaApifyDirect(thailandMode);
}
