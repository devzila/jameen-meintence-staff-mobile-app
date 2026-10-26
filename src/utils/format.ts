import i18n from '@/i18n';

function intlLocale() {
  const lang = i18n.resolvedLanguage || i18n.language || 'en';
  return lang === 'en' ? 'en-IN' : `${lang}-IN`;
}

function parse(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | null): string {
  const date = parse(value);
  if (!date) return '';
  try {
    return date.toLocaleDateString(intlLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

export function formatDateTime(value?: string | null): string {
  const date = parse(value);
  if (!date) return '';
  try {
    return date.toLocaleString(intlLocale(), {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return date.toLocaleString();
  }
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** "3 hours ago" / "in 2 days"; falls back to an absolute date when Intl lacks relative time. */
export function formatRelative(value?: string | null, now = Date.now()): string {
  const date = parse(value);
  if (!date) return '';
  const diff = date.getTime() - now;
  if (Math.abs(diff) > 7 * 86_400_000) return formatDate(value);
  if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat !== 'function') {
    return formatDateTime(value);
  }
  const rtf = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto' });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(0, 'minute');
}

export function formatAvailability(date?: string | null, time?: string | null): string {
  return [formatDate(date) || date, time].filter(Boolean).join(' · ');
}

export function humanize(value?: string | null): string {
  if (!value) return '';
  const text = value.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
