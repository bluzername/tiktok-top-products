import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ApifyResponse {
  code: number;
  msg: string;
  data: {
    list?: unknown[];
    pagination?: { page: number; size: number; total: number; has_more: boolean };
  } | null;
}

function getWeekDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day - 7;
  const lastSunday = new Date(now.getFullYear(), now.getMonth(), diff);
  return lastSunday.toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.APIFY_TOKEN;
  const cookies = process.env.TIKTOK_COOKIES;

  if (!token || !cookies) {
    return res.status(500).json({ error: 'Server configuration error: missing credentials' });
  }

  const thailandMode = req.query.thailand !== 'false';

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/doliz~tiktok-creative-center-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'top_products',
          cookies,
          top_products_country: thailandMode ? 'TH' : '',
          top_products_level: 'l3',
          top_products_first_category: [],
          top_products_second_category: [],
          top_products_period_type: 'week',
          top_products_date: getWeekDate(),
          top_products_order_field: 'ctr',
          top_products_order_type: 'desc',
          top_products_page: 1,
          top_products_limit: 20,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `Apify API error: ${response.status}`, details: errorText });
    }

    const data: ApifyResponse[] = await response.json();
    const result = data[0];

    if (!result) {
      return res.status(502).json({ error: 'Empty response array from Apify' });
    }

    // Check for TikTok API errors (code !== 0 or error message)
    if (result.msg && result.msg !== 'OK' && result.msg !== '') {
      return res.status(502).json({ error: result.msg });
    }

    if (!result.data) {
      return res.status(502).json({ error: 'No data in response', msg: result.msg, code: result.code });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Failed to fetch products', details: String(error) });
  }
}
