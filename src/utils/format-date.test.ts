import { describe, expect, it } from 'vitest';
import { formatFetchedAt } from '@/utils/format-date';

describe('formatFetchedAt', () => {
  it('returns null for null or invalid input', () => {
    expect(formatFetchedAt(null)).toBeNull();
    expect(formatFetchedAt('not a date')).toBeNull();
  });

  it('formats a valid ISO timestamp with a year', () => {
    expect(formatFetchedAt('2026-09-14T06:00:00Z')).toContain('2026');
  });
});
