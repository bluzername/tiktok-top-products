import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeekDate } from './week-date';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / DAY_MS;
}

describe('getWeekDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM-DD', () => {
    expect(getWeekDate(new Date('2026-09-16T10:00:00Z'))).toMatch(ISO_DATE);
  });

  it('returns a Sunday at least 7 days back for every weekday', () => {
    const monday = new Date('2026-09-14T00:00:00Z');
    for (let offset = 0; offset < 7; offset += 1) {
      const now = new Date(monday.getTime() + offset * DAY_MS);
      const result = new Date(`${getWeekDate(now)}T00:00:00Z`);
      expect(result.getUTCDay()).toBe(0);
      expect(daysBetween(now, result)).toBeGreaterThanOrEqual(7);
      expect(daysBetween(now, result)).toBeLessThan(15);
    }
  });

  it('skips the most recent Sunday and returns the one before it', () => {
    // Wednesday 2026-09-16: last Sunday is 09-13, the one before is 09-06
    expect(getWeekDate(new Date('2026-09-16T12:00:00Z'))).toBe('2026-09-06');
  });

  it('on a Sunday goes back two full weeks', () => {
    expect(getWeekDate(new Date('2026-09-13T12:00:00Z'))).toBe('2026-08-30');
  });

  it('uses the current time when no date is passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z')); // Friday
    expect(getWeekDate()).toBe('2025-12-21');
  });

  it('does not mutate the input date', () => {
    const now = new Date('2026-09-16T12:00:00Z');
    getWeekDate(now);
    expect(now.toISOString()).toBe('2026-09-16T12:00:00.000Z');
  });
});
