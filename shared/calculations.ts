/**
 * Manufacturing score = (CTR * CVR) / CPA.
 * High click-through and conversion with a low cost per acquisition scores highest.
 * A CPA of 0 means no acquisition data, so the score is 0 rather than Infinity.
 */
export function calculateManufacturingScore(ctr: number, cvr: number, cpa: number): number {
  if (cpa === 0) return 0;
  return (ctr * cvr) / cpa;
}
