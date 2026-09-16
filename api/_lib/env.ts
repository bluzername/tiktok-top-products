import { DEFAULT_APIFY_ACTOR_ID, DEFAULT_TOP_PRODUCTS_LIMIT } from '../../shared/apify-request.js';

export interface ApifyCredentials {
  token: string;
  cookies: string;
}

export interface ApifyConfig extends ApifyCredentials {
  actorId: string;
  limit: number;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function parseLimit(raw: string | undefined): number {
  if (raw === undefined || raw === '') return DEFAULT_TOP_PRODUCTS_LIMIT;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ConfigError(`TOP_PRODUCTS_LIMIT must be a positive integer, got "${raw}"`);
  }
  return parsed;
}

/** Reads and validates the Apify related env vars. Throws ConfigError when credentials are missing. */
export function getApifyConfig(env: NodeJS.ProcessEnv = process.env): ApifyConfig {
  const token = env.APIFY_TOKEN;
  const cookies = env.TIKTOK_COOKIES;
  if (!token || !cookies) {
    throw new ConfigError('Missing APIFY_TOKEN or TIKTOK_COOKIES; set both in the Vercel project env vars');
  }
  return {
    token,
    cookies,
    actorId: env.APIFY_ACTOR_ID || DEFAULT_APIFY_ACTOR_ID,
    limit: parseLimit(env.TOP_PRODUCTS_LIMIT),
  };
}

export function getCronSecret(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.CRON_SECRET || undefined;
}
