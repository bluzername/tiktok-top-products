import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_RAW, apifyOkResponse, fakeRequest, fakeResponse, stubFetch } from './helpers';

const SECRET = 'cron-secret';

async function loadHandler() {
  vi.resetModules();
  const mod = await import('../../api/products');
  return mod.default;
}

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.stubEnv('APIFY_TOKEN', 'token');
    vi.stubEnv('TIKTOK_COOKIES', 'cookie=1');
    vi.stubEnv('CRON_SECRET', SECRET);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects non-GET', async () => {
    const handler = await loadHandler();
    const out = fakeResponse();
    await handler(fakeRequest({ method: 'POST' }), out.res);
    expect(out.status()).toBe(405);
  });

  it('fetches live on a miss, then serves the cache without calling Apify again', async () => {
    const fetchMock = stubFetch(async () => apifyOkResponse(SAMPLE_RAW));
    const handler = await loadHandler();

    const first = fakeResponse();
    await handler(fakeRequest({ query: { thailand: 'true' } }), first.res);
    expect(first.status()).toBe(200);
    expect(first.header('X-Cache')).toBe('MISS');
    expect(first.header('X-Cache-Backend')).toBe('memory');
    expect(first.body()).toMatchObject({ region: 'TH', products: [{ name: 'foo bar', manufacturingScore: 0.5 }] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('doliz~tiktok-creative-center-scraper');

    const second = fakeResponse();
    await handler(fakeRequest({ query: { thailand: 'true' } }), second.res);
    expect(second.status()).toBe(200);
    expect(second.header('X-Cache')).toBe('HIT');
    expect(second.header('Cache-Control')).toContain('stale-while-revalidate');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps regions in separate cache entries', async () => {
    const fetchMock = stubFetch(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      return apifyOkResponse([{ url_title: body.top_products_country || 'global' }]);
    });
    const handler = await loadHandler();
    const th = fakeResponse();
    await handler(fakeRequest({ query: { thailand: 'true' } }), th.res);
    const global = fakeResponse();
    await handler(fakeRequest({ query: { thailand: 'false' } }), global.res);
    expect((th.body() as { products: { name: string }[] }).products[0].name).toBe('TH');
    expect((global.body() as { products: { name: string }[] }).products[0].name).toBe('global');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns 502 with a hint when there is no cache and Apify fails', async () => {
    stubFetch(async () => new Response('boom', { status: 500 }));
    const handler = await loadHandler();
    const out = fakeResponse();
    await handler(fakeRequest({}), out.res);
    expect(out.status()).toBe(502);
    expect(out.body()).toMatchObject({ error: 'Failed to fetch products', hint: expect.stringContaining('TIKTOK_COOKIES') });
    expect(out.header('Cache-Control')).toBe('no-store');
  });

  it('returns 502 when TikTok reports an error message', async () => {
    stubFetch(async () => new Response(JSON.stringify([{ code: 40101, msg: 'login required', data: null }])));
    const handler = await loadHandler();
    const out = fakeResponse();
    await handler(fakeRequest({}), out.res);
    expect(out.status()).toBe(502);
    expect(out.body()).toMatchObject({ details: expect.stringContaining('login required') });
  });

  it('returns 500 when credentials are missing and no cache exists', async () => {
    vi.stubEnv('APIFY_TOKEN', '');
    const handler = await loadHandler();
    const out = fakeResponse();
    await handler(fakeRequest({}), out.res);
    expect(out.status()).toBe(500);
    expect(out.body()).toMatchObject({ error: 'Server configuration error' });
  });

  it('rejects force=1 without the cron secret and honours it with the secret', async () => {
    const fetchMock = stubFetch(async () => apifyOkResponse(SAMPLE_RAW));
    const handler = await loadHandler();

    await handler(fakeRequest({}), fakeResponse().res);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const denied = fakeResponse();
    await handler(fakeRequest({ query: { force: '1' } }), denied.res);
    expect(denied.status()).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const forced = fakeResponse();
    await handler(fakeRequest({ query: { force: '1' }, authorization: `Bearer ${SECRET}` }), forced.res);
    expect(forced.status()).toBe(200);
    expect(forced.header('X-Cache')).toBe('MISS');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
