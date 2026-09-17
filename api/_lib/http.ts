import type { VercelResponse } from '@vercel/node';

/** Serve cached data for an hour at the edge, then stale for a day while the cron refreshes. */
export const CACHE_HIT_HEADER = 'public, s-maxage=3600, stale-while-revalidate=86400';
export const NO_STORE_HEADER = 'no-store';

export interface ErrorBody {
  error: string;
  hint?: string;
  details?: string;
}

export function sendError(res: VercelResponse, status: number, body: ErrorBody): VercelResponse {
  res.setHeader('Cache-Control', NO_STORE_HEADER);
  return res.status(status).json(body);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
