import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cacheKeyFor, type ProductsPayload } from '../shared/types.js';
import { fetchTopProducts } from './_lib/apify.js';
import { isAuthorizedCron } from './_lib/auth.js';
import { cacheBackendName, readCache, writeCache } from './_lib/cache.js';
import { ConfigError, getApifyConfig, getCronSecret } from './_lib/env.js';
import { CACHE_HIT_HEADER, NO_STORE_HEADER, errorMessage, sendError } from './_lib/http.js';

const APIFY_FAILURE_HINT =
  'No cached data exists yet and the live Apify fetch failed. Check APIFY_TOKEN, refresh TIKTOK_COOKIES, then call /api/refresh with the cron secret.';

function resolveForceRefresh(req: VercelRequest): { force: boolean; unauthorized: boolean } {
  if (req.query.force !== '1') return { force: false, unauthorized: false };
  const authorized = isAuthorizedCron(req, getCronSecret());
  return { force: authorized, unauthorized: !authorized };
}

function sendPayload(res: VercelResponse, payload: ProductsPayload, cacheStatus: 'HIT' | 'MISS'): VercelResponse {
  res.setHeader('Cache-Control', cacheStatus === 'HIT' ? CACHE_HIT_HEADER : NO_STORE_HEADER);
  res.setHeader('X-Cache', cacheStatus);
  res.setHeader('X-Cache-Backend', cacheBackendName());
  return res.status(200).json(payload);
}

async function fetchLiveAndCache(key: string, thailandMode: boolean): Promise<ProductsPayload> {
  const payload = await fetchTopProducts(getApifyConfig(), thailandMode);
  try {
    await writeCache(key, payload);
  } catch (error) {
    console.error(`Cache write failed for ${key}: ${errorMessage(error)}`);
  }
  return payload;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return sendError(res, 405, { error: 'Method not allowed' });
  }

  const { force, unauthorized } = resolveForceRefresh(req);
  if (unauthorized) {
    return sendError(res, 401, { error: 'force=1 requires Authorization: Bearer <CRON_SECRET>' });
  }

  const thailandMode = req.query.thailand !== 'false';
  const key = cacheKeyFor(thailandMode);

  if (!force) {
    try {
      const cached = await readCache<ProductsPayload>(key);
      if (cached) return sendPayload(res, cached, 'HIT');
    } catch (error) {
      console.error(`Cache read failed for ${key}: ${errorMessage(error)}`);
    }
  }

  try {
    const payload = await fetchLiveAndCache(key, thailandMode);
    return sendPayload(res, payload, 'MISS');
  } catch (error) {
    const message = errorMessage(error);
    console.error(`Live fetch failed for ${key}: ${message}`);
    if (error instanceof ConfigError) {
      return sendError(res, 500, { error: 'Server configuration error', details: message });
    }
    return sendError(res, 502, { error: 'Failed to fetch products', hint: APIFY_FAILURE_HINT, details: message });
  }
}
