import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cacheKeyFor, regionFor, type Region } from '../shared/types.js';
import { fetchTopProducts } from './_lib/apify.js';
import { isAuthorizedCron } from './_lib/auth.js';
import { cacheBackendName, writeCache } from './_lib/cache.js';
import { ConfigError, getApifyConfig, getCronSecret, type ApifyConfig } from './_lib/env.js';
import { errorMessage, sendError } from './_lib/http.js';

const REGIONS: ReadonlyArray<boolean> = [true, false];

type RefreshResult =
  | { region: Region; ok: true; weekDate: string; fetchedAt: string; count: number }
  | { region: Region; ok: false; error: string };

async function refreshRegion(config: ApifyConfig, thailandMode: boolean): Promise<RefreshResult> {
  const region = regionFor(thailandMode);
  try {
    const payload = await fetchTopProducts(config, thailandMode);
    await writeCache(cacheKeyFor(thailandMode), payload);
    return { region, ok: true, weekDate: payload.weekDate, fetchedAt: payload.fetchedAt, count: payload.products.length };
  } catch (error) {
    const message = errorMessage(error);
    console.error(`Refresh failed for ${region}: ${message}`);
    return { region, ok: false, error: message };
  }
}

/**
 * Vercel Cron entry point (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`
 * automatically; the same header lets an operator trigger it manually with curl.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendError(res, 405, { error: 'Method not allowed' });
  }

  const secret = getCronSecret();
  if (!secret) {
    return sendError(res, 500, { error: 'CRON_SECRET is not configured', hint: 'Set CRON_SECRET in the Vercel project env vars' });
  }
  if (!isAuthorizedCron(req, secret)) {
    return sendError(res, 401, { error: 'Unauthorized' });
  }

  let config: ApifyConfig;
  try {
    config = getApifyConfig();
  } catch (error) {
    const details = error instanceof ConfigError ? error.message : errorMessage(error);
    return sendError(res, 500, { error: 'Server configuration error', details });
  }

  const results = await Promise.all(REGIONS.map(thailandMode => refreshRegion(config, thailandMode)));
  const allOk = results.every(result => result.ok);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(allOk ? 200 : 502).json({ ok: allOk, backend: cacheBackendName(), results });
}
