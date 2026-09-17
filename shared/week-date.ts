const DAYS_PER_WEEK = 7;

/**
 * TikTok Creative Center keys weekly data on a Sunday date.
 * Returns the Sunday that starts the last complete week: the most recent past
 * Sunday, then one more week back so the data set is guaranteed to exist.
 * Always at least 7 days before `now`. Formatted as YYYY-MM-DD (UTC).
 */
export function getWeekDate(now: Date = new Date()): string {
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const daysToLastSunday = dayOfWeek === 0 ? DAYS_PER_WEEK : dayOfWeek;
  const sunday = new Date(now.getTime());
  sunday.setUTCDate(now.getUTCDate() - daysToLastSunday - DAYS_PER_WEEK);
  return sunday.toISOString().slice(0, 10);
}
