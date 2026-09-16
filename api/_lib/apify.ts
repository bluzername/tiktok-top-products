import {
  buildApifyRequestBody,
  buildApifyRunSyncUrl,
  extractProductList,
  type ApifyActorResult,
} from '../../shared/apify-request.js';
import { normalizeProducts } from '../../shared/normalize-product.js';
import { getWeekDate } from '../../shared/week-date.js';
import { regionFor, type ProductsPayload } from '../../shared/types.js';
import type { ApifyConfig } from './env.js';

const ERROR_BODY_PREVIEW_CHARS = 500;

export class ApifyError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApifyError';
    this.status = status;
  }
}

async function runActor(config: ApifyConfig, thailandMode: boolean, weekDate: string): Promise<unknown[]> {
  const body = buildApifyRequestBody({
    cookies: config.cookies,
    thailandMode,
    weekDate,
    limit: config.limit,
  });
  const response = await fetch(buildApifyRunSyncUrl(config.actorId, config.token), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const preview = (await response.text()).slice(0, ERROR_BODY_PREVIEW_CHARS);
    throw new ApifyError(`Apify API responded ${response.status}: ${preview}`, response.status);
  }
  const results = (await response.json()) as ApifyActorResult[];
  try {
    return extractProductList(results);
  } catch (error) {
    throw new ApifyError(error instanceof Error ? error.message : String(error));
  }
}

/** Runs the actor synchronously (up to ~2 minutes) and returns a normalized payload. */
export async function fetchTopProducts(config: ApifyConfig, thailandMode: boolean): Promise<ProductsPayload> {
  const weekDate = getWeekDate();
  const items = await runActor(config, thailandMode, weekDate);
  return {
    products: normalizeProducts(items),
    region: regionFor(thailandMode),
    weekDate,
    fetchedAt: new Date().toISOString(),
  };
}
