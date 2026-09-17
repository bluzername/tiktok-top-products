import { describe, expect, it } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { isAuthorizedCron } from './auth';

function requestWith(authorization?: string): VercelRequest {
  return { headers: authorization ? { authorization } : {} } as unknown as VercelRequest;
}

describe('isAuthorizedCron', () => {
  it('accepts a matching bearer token', () => {
    expect(isAuthorizedCron(requestWith('Bearer s3cret'), 's3cret')).toBe(true);
  });

  it('rejects a wrong or malformed token', () => {
    expect(isAuthorizedCron(requestWith('Bearer nope'), 's3cret')).toBe(false);
    expect(isAuthorizedCron(requestWith('s3cret'), 's3cret')).toBe(false);
    expect(isAuthorizedCron(requestWith('Bearer s3cret-extra'), 's3cret')).toBe(false);
  });

  it('rejects when the header or the secret is missing', () => {
    expect(isAuthorizedCron(requestWith(), 's3cret')).toBe(false);
    expect(isAuthorizedCron(requestWith('Bearer s3cret'), undefined)).toBe(false);
    expect(isAuthorizedCron(requestWith('Bearer '), '')).toBe(false);
  });
});
