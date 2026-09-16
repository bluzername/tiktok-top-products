const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

/** "Data as of" label for an ISO timestamp; returns null when the timestamp is missing or invalid. */
export function formatFetchedAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, DATE_TIME_FORMAT).format(date);
}
