export function calculateManufacturingScore(ctr: number, cvr: number, cpa: number): number {
  if (cpa === 0) return 0;
  return (ctr * cvr) / cpa;
}
