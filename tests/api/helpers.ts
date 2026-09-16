import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vi } from 'vitest';

export interface FakeResponse {
  res: VercelResponse;
  status: () => number;
  body: () => unknown;
  header: (name: string) => string | undefined;
}

export function fakeRequest(options: {
  method?: string;
  query?: Record<string, string>;
  authorization?: string;
}): VercelRequest {
  return {
    method: options.method ?? 'GET',
    query: options.query ?? {},
    headers: options.authorization ? { authorization: options.authorization } : {},
  } as unknown as VercelRequest;
}

export function fakeResponse(): FakeResponse {
  const state = { status: 0, body: undefined as unknown, headers: new Map<string, string>() };
  const res = {
    setHeader: (name: string, value: string) => {
      state.headers.set(name.toLowerCase(), value);
      return res;
    },
    status: (code: number) => {
      state.status = code;
      return res;
    },
    json: (body: unknown) => {
      state.body = body;
      return res;
    },
  } as unknown as VercelResponse;
  return {
    res,
    status: () => state.status,
    body: () => state.body,
    header: name => state.headers.get(name.toLowerCase()),
  };
}

export function apifyOkResponse(list: unknown[]): Response {
  return new Response(JSON.stringify([{ code: 0, msg: 'OK', data: { list } }]), { status: 200 });
}

export function stubFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  const mock = vi.fn(impl);
  vi.stubGlobal('fetch', mock);
  return mock;
}

export const SAMPLE_RAW = [
  { url_title: 'foo-bar', ctr: 1, cvr: 2, cpa: 4, first_ecom_category: { id: '1', value: 'A' } },
];
