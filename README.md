# TikTok Top Products

A small dashboard of the weekly top products from TikTok Creative Center (TikTok Shop ads data), ranked by a
"manufacturing score" that favours products with strong click-through and conversion at a low cost per
acquisition. Built for spotting products worth sourcing or manufacturing.

Data is pulled through the Apify actor `doliz~tiktok-creative-center-scraper`, cached weekly, and served by a
Vercel serverless function. Page loads never trigger a scraper run.

## What it shows

One table, 20 products (configurable), for either Thailand or global, with:

| Column | Meaning |
| --- | --- |
| CTR (%) | Click-through rate of the product's ads |
| CVR (%) | Conversion rate |
| CPA ($) | Cost per acquisition |
| Popularity | Week-over-week change in post volume |
| Mfg Score | `(CTR * CVR) / CPA`, or 0 when CPA is 0 (see below) |

The sidebar filters by first-level e-commerce category. Columns are sortable; the default sort is manufacturing
score, descending. The header shows when the data was fetched and which week it covers.

### Manufacturing score

Defined in `shared/calculations.ts`:

```
score = (ctr * cvr) / cpa      cpa > 0
score = 0                      cpa == 0
```

High CTR and CVR mean the audience wants the product; a low CPA means it sells cheaply. Dividing by CPA rewards
cheap acquisition. A CPA of 0 means there is no acquisition data, so the score is 0 rather than infinity.

## Architecture

```
Browser (Vite SPA, React 19, Tailwind 4)
   |  GET /api/products?thailand=true|false
   v
api/products.ts (Vercel function)
   |  readCache(key)  --> hit: return snapshot (X-Cache: HIT, s-maxage=3600, stale-while-revalidate=86400)
   |                  --> miss: run Apify once, writeCache, return (X-Cache: MISS)
   v
api/_lib/cache.ts  --> Vercel Blob (cache/products-th.json, cache/products-global.json)
                       or an in-memory map when BLOB_READ_WRITE_TOKEN is unset

Vercel Cron, Mondays 06:00 UTC (vercel.json)
   |  GET /api/refresh with Authorization: Bearer $CRON_SECRET
   v
api/refresh.ts  --> runs the Apify actor for both regions and overwrites the cache
```

- `shared/` holds pure code used by both the Vercel functions and the SPA: week-date maths, the Apify request
  body, product normalization, and the score formula. It has no DOM or Node imports.
- `api/_lib/` holds server-only helpers: env parsing, cron auth (timing-safe bearer compare), the Apify client,
  and the cache abstraction (`readCache` / `writeCache`) so the storage backend can be swapped.
- The cron is the only scheduled path to Apify. A page load calls Apify only when no cache exists at all
  (first deploy, or a Blob store that was wiped). `?force=1` on `/api/products` bypasses the cache but requires
  the cron secret.

### Data freshness

TikTok publishes weekly data keyed on a Sunday. `getWeekDate()` picks the Sunday that starts the last complete
week (always at least 7 days back) so the data set exists. The cron runs Monday 06:00 UTC; the snapshot then
serves for the week. The header shows "Data as of <fetchedAt> (week of <weekDate>)".

## Setup

### 1. Apify

Create an Apify account, note the API token (Console > Settings > Integrations). Runs of the actor are billed
per run; with the cron, expect 2 runs per week.

### 2. TikTok Creative Center cookies

The actor needs a logged-in Creative Center session. Log in at
`https://ads.tiktok.com/business/creativecenter`, open DevTools > Network, pick any request to `ads.tiktok.com`
and copy the whole request `Cookie` header value. Sessions expire after days to weeks; when they do, the refresh
starts returning a TikTok API error while the cached snapshot keeps serving. Paste fresh cookies into the Vercel
env var and trigger `/api/refresh` manually.

### 3. Vercel

Deploy the repo to Vercel (framework preset: Vite). Then:

1. Storage > Create > Blob. Connect the store to the project; `BLOB_READ_WRITE_TOKEN` is injected automatically.
2. Settings > Environment Variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `APIFY_TOKEN` | yes | Apify API token |
| `TIKTOK_COOKIES` | yes | Creative Center cookie header |
| `CRON_SECRET` | yes | Bearer secret for `/api/refresh` and `?force=1`. Vercel sends it on cron runs. `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN` | yes in prod | Injected by the Blob store; without it the cache is per-process memory |
| `APIFY_ACTOR_ID` | no | Defaults to `doliz~tiktok-creative-center-scraper` |
| `TOP_PRODUCTS_LIMIT` | no | Defaults to 20 |

3. Redeploy, then warm the cache once:

```sh
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>.vercel.app/api/refresh
```

The response lists both regions with `ok`, `weekDate`, `fetchedAt` and `count`. After that, `/api/products`
returns `X-Cache: HIT`.

## Local development

```sh
npm ci
cp .env.example .env
npm run dev
```

Two modes:

- **Cache mode (default).** With `VITE_APIFY_TOKEN` unset, the SPA calls `/api/products`. Run the functions with
  `vercel dev` (needs the Vercel CLI and the server env vars above in `.env`), or point the Vite dev server at a
  deployed instance with a proxy. Without `BLOB_READ_WRITE_TOKEN` the cache is in-memory for the life of the
  `vercel dev` process.
- **Direct mode.** Set `VITE_APIFY_TOKEN` and `VITE_TIKTOK_COOKIES` in `.env`; the browser then calls Apify
  directly. Every reload is a paid ~2 minute actor run. Direct mode is disabled in production builds.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check the SPA (`tsc -b`) and build to `dist/` |
| `npm run lint` | ESLint over the whole repo |
| `npm run typecheck:api` | Type-check `api/` and `shared/` with `tsconfig.api.json` |
| `npm test` | Vitest unit tests (`shared/`, `src/utils`, `api/_lib`) |
| `npm run preview` | Serve the production build locally |

CI (`.github/workflows/ci.yml`) runs lint, `typecheck:api`, tests and build on Node 22. Dependabot opens weekly
PRs for npm and GitHub Actions.

## API

`GET /api/products?thailand=true|false`

```json
{
  "products": [{ "id": "product-0", "name": "...", "ctr": 1.2, "cvr": 3.4, "cpa": 5.6, "manufacturingScore": 0.73, "...": "..." }],
  "region": "TH",
  "weekDate": "2026-09-06",
  "fetchedAt": "2026-09-14T06:00:12.345Z"
}
```

Headers: `X-Cache: HIT|MISS`, `X-Cache-Backend: blob|memory`. Errors are JSON with `error`, and `hint` plus
`details` when relevant. A 502 means no cache existed and the live Apify run failed (check the token and
cookies). `?force=1` needs `Authorization: Bearer <CRON_SECRET>` and returns 401 otherwise.

`GET|POST /api/refresh` with `Authorization: Bearer <CRON_SECRET>`: refreshes both regions; 200 when both
succeeded, 502 with per-region errors otherwise, 401 without the secret, 500 when `CRON_SECRET` is unset.

## Limitations

- One actor run per region per week; the dashboard is a weekly snapshot, not live data.
- Cookies are a manual dependency. There is no automated re-login; expired cookies surface as failed refreshes.
- The score formula is a heuristic. It ignores volume (impressions, post counts) and category baselines.
- No auth on the dashboard itself; the data is public TikTok Creative Center data.
- Only page 1 of the Creative Center ranking (sorted by CTR at the source) is fetched.
