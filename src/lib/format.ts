import { format as formatDateFns, isValid, parseISO } from 'date-fns';

import { appConfig } from '@/config';

function toDate(value: Date | string | number): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }

  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return parsed;
  }

  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

/** Formats a date using the app default or an explicit date-fns pattern. */
export function formatDate(
  value: Date | string | number | null | undefined,
  pattern: string = appConfig.dateFormat,
): string {
  if (value === null || value === undefined) {
    return '';
  }

  const date = toDate(value);
  if (!date) {
    return '';
  }

  return formatDateFns(date, pattern);
}

/** Formats a date-time using the app default date-time pattern. */
export function formatDateTime(value: Date | string | number | null | undefined): string {
  return formatDate(value, appConfig.dateTimeFormat);
}

/** Formats a monetary amount using the app currency and locale. */
export function formatCurrency(
  amount: number | null | undefined,
  options?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '';
  }

  return new Intl.NumberFormat(options?.locale ?? appConfig.locale, {
    style: 'currency',
    currency: options?.currency ?? appConfig.currency,
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  }).format(amount);
}

/** Formats a number using the app locale. */
export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions & { locale?: string },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }

  const { locale, ...formatOptions } = options ?? {};
  return new Intl.NumberFormat(locale ?? appConfig.locale, formatOptions).format(value);
}
