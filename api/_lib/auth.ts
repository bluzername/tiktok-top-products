import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';

const BEARER_PREFIX = 'Bearer ';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** True when the request carries `Authorization: Bearer <secret>` matching the configured secret. */
export function isAuthorizedCron(req: VercelRequest, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) return false;
  return safeEqual(header.slice(BEARER_PREFIX.length), secret);
}
