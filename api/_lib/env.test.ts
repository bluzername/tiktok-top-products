import { describe, expect, it } from 'vitest';
import { ConfigError, getApifyConfig, getCronSecret } from './env';

const base = { APIFY_TOKEN: 't', TIKTOK_COOKIES: 'c' };

describe('getApifyConfig', () => {
  it('applies defaults for actor id and limit', () => {
    expect(getApifyConfig(base)).toEqual({
      token: 't',
      cookies: 'c',
      actorId: 'doliz~tiktok-creative-center-scraper',
      limit: 20,
    });
  });

  it('honours APIFY_ACTOR_ID and TOP_PRODUCTS_LIMIT overrides', () => {
    expect(getApifyConfig({ ...base, APIFY_ACTOR_ID: 'me~actor', TOP_PRODUCTS_LIMIT: '50' })).toMatchObject({
      actorId: 'me~actor',
      limit: 50,
    });
  });

  it('throws ConfigError when credentials are missing', () => {
    expect(() => getApifyConfig({})).toThrow(ConfigError);
    expect(() => getApifyConfig({ APIFY_TOKEN: 't' })).toThrow(/TIKTOK_COOKIES/);
  });

  it('rejects a non-positive or non-integer limit', () => {
    expect(() => getApifyConfig({ ...base, TOP_PRODUCTS_LIMIT: '0' })).toThrow(ConfigError);
    expect(() => getApifyConfig({ ...base, TOP_PRODUCTS_LIMIT: 'abc' })).toThrow(/positive integer/);
  });
});

describe('getCronSecret', () => {
  it('treats an empty string as unset', () => {
    expect(getCronSecret({ CRON_SECRET: '' })).toBeUndefined();
    expect(getCronSecret({ CRON_SECRET: 'x' })).toBe('x');
  });
});
