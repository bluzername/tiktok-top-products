export const DEFAULT_APIFY_ACTOR_ID = 'doliz~tiktok-creative-center-scraper';
export const DEFAULT_TOP_PRODUCTS_LIMIT = 20;
const APIFY_API_BASE = 'https://api.apify.com/v2/acts';

export interface ApifyRequestParams {
  cookies: string;
  thailandMode: boolean;
  weekDate: string;
  limit?: number;
}

export interface ApifyActorResult {
  code: number;
  msg: string;
  data: { list?: unknown[] } | null;
}

/** Builds the input for the TikTok Creative Center actor's `top_products` target. */
export function buildApifyRequestBody(params: ApifyRequestParams) {
  const { cookies, thailandMode, weekDate, limit = DEFAULT_TOP_PRODUCTS_LIMIT } = params;
  return {
    target: 'top_products',
    cookies,
    top_products_country: thailandMode ? 'TH' : '',
    top_products_level: 'l3',
    top_products_first_category: [],
    top_products_second_category: [],
    top_products_period_type: 'week',
    top_products_date: weekDate,
    top_products_order_field: 'ctr',
    top_products_order_type: 'desc',
    top_products_page: 1,
    top_products_limit: limit,
  };
}

/** Synchronous run endpoint that returns dataset items directly. */
export function buildApifyRunSyncUrl(actorId: string, token: string): string {
  const encodedActor = encodeURIComponent(actorId);
  return `${APIFY_API_BASE}/${encodedActor}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
}

/**
 * Validates the actor's response and returns the raw product list.
 * Throws with a descriptive message when TikTok or Apify reported a failure.
 */
export function extractProductList(results: ApifyActorResult[] | undefined): unknown[] {
  const first = results?.[0];
  if (!first) {
    throw new Error('Apify returned an empty result set (the actor produced no dataset items)');
  }
  if (first.msg && first.msg !== 'OK') {
    throw new Error(`TikTok API error: ${first.msg} (code ${first.code})`);
  }
  if (!first.data) {
    throw new Error(`TikTok API returned no data (code ${first.code}, msg "${first.msg}")`);
  }
  return first.data.list ?? [];
}
