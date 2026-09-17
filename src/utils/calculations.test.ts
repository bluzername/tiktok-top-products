import { describe, expect, it } from 'vitest';
import { calculateManufacturingScore } from '@/utils/calculations';

describe('calculateManufacturingScore', () => {
  it('is (ctr * cvr) / cpa', () => {
    expect(calculateManufacturingScore(0.5, 0.2, 2)).toBeCloseTo(0.05);
  });

  it('returns 0 when cpa is 0 instead of Infinity', () => {
    expect(calculateManufacturingScore(1, 1, 0)).toBe(0);
  });

  it('returns 0 when ctr or cvr is 0', () => {
    expect(calculateManufacturingScore(0, 0.5, 3)).toBe(0);
    expect(calculateManufacturingScore(0.5, 0, 3)).toBe(0);
  });

  it('ranks a cheaper acquisition higher at equal ctr and cvr', () => {
    expect(calculateManufacturingScore(0.1, 0.1, 1)).toBeGreaterThan(calculateManufacturingScore(0.1, 0.1, 5));
  });
});
