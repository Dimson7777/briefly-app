const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelative(iso: string): string {
  const diffMs = +new Date(iso) - Date.now();
  const abs = Math.abs(diffMs);
  const min = 60_000, hr = 60 * min, day = 24 * hr, week = 7 * day;
  if (abs < hr) return RTF.format(Math.round(diffMs / min), 'minute');
  if (abs < day) return RTF.format(Math.round(diffMs / hr), 'hour');
  if (abs < week) return RTF.format(Math.round(diffMs / day), 'day');
  if (abs < 30 * day) return RTF.format(Math.round(diffMs / week), 'week');
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const day = 86_400_000;
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / day);
}
