import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_RAW, apifyOkResponse, fakeRequest, fakeResponse, stubFetch } from './helpers';

const SECRET = 'cron-secret';

async function loadHandlers() {
  vi.resetModules();
  const refresh = (await import('../../api/refresh')).default;
  const products = (await import('../../api/products')).default;
  return { refresh, products };
}

describe('/api/refresh', () => {
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

  it('returns 401 without a matching bearer token', async () => {
    const fetchMock = stubFetch(async () => apifyOkResponse(SAMPLE_RAW));
    const { refresh } = await loadHandlers();
    const out = fakeResponse();
    await refresh(fakeRequest({ authorization: 'Bearer wrong' }), out.res);
    expect(out.status()).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 500 when CRON_SECRET is unset', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const { refresh } = await loadHandlers();
    const out = fakeResponse();
    await refresh(fakeRequest({ authorization: 'Bearer anything' }), out.res);
    expect(out.status()).toBe(500);
  });

  it('refreshes both regions and warms the cache used by /api/products', async () => {
    const fetchMock = stubFetch(async () => apifyOkResponse(SAMPLE_RAW));
    const { refresh, products } = await loadHandlers();

    const out = fakeResponse();
    await refresh(fakeRequest({ authorization: `Bearer ${SECRET}` }), out.res);
    expect(out.status()).toBe(200);
    expect(out.body()).toMatchObject({
      ok: true,
      results: [
        { region: 'TH', ok: true, count: 1 },
        { region: 'global', ok: true, count: 1 },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const hit = fakeResponse();
    await products(fakeRequest({ query: { thailand: 'false' } }), hit.res);
    expect(hit.header('X-Cache')).toBe('HIT');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports partial failure with 502 and per-region errors', async () => {
    stubFetch(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      return body.top_products_country === 'TH' ? new Response('down', { status: 503 }) : apifyOkResponse(SAMPLE_RAW);
    });
    const { refresh } = await loadHandlers();
    const out = fakeResponse();
    await refresh(fakeRequest({ authorization: `Bearer ${SECRET}` }), out.res);
    expect(out.status()).toBe(502);
    expect(out.body()).toMatchObject({
      ok: false,
      results: [
        { region: 'TH', ok: false, error: expect.stringContaining('503') },
        { region: 'global', ok: true },
      ],
    });
  });
});
