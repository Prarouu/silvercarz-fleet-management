/**
 * Pure date-range helpers for calendar viewports.
 * ISO dates only (`YYYY-MM-DD`). No business rules.
 */

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { CalendarViewImplemented } from '@/features/calendar/types';

export function todayIsoDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isIsoDate(value: string | undefined | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseISO(value);
  return !Number.isNaN(parsed.getTime()) && format(parsed, 'yyyy-MM-dd') === value;
}

export function formatIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export type CalendarDateRange = {
  readonly start: string;
  readonly end: string;
};

/** Inclusive day/week/month window for the given anchor date. */
export function rangeForView(view: CalendarViewImplemented, anchorIso: string): CalendarDateRange {
  const anchor = parseISO(anchorIso);

  switch (view) {
    case 'day':
      return { start: anchorIso, end: anchorIso };
    case 'week': {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      return { start: formatIsoDate(start), end: formatIsoDate(end) };
    }
    case 'month': {
      const start = startOfMonth(anchor);
      const end = endOfMonth(anchor);
      return { start: formatIsoDate(start), end: formatIsoDate(end) };
    }
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

/**
 * Resolve the data-loading window.
 * Explicit from/to wins when both are valid; otherwise view + date.
 */
export function resolveCalendarRange(params: {
  readonly view: CalendarViewImplemented;
  readonly date: string;
  readonly from?: string;
  readonly to?: string;
}): CalendarDateRange {
  if (params.from && params.to && isIsoDate(params.from) && isIsoDate(params.to)) {
    if (params.from <= params.to) {
      return { start: params.from, end: params.to };
    }
    return { start: params.to, end: params.from };
  }

  return rangeForView(params.view, params.date);
}

/** Ordered ISO dates from start through end inclusive. */
export function enumerateDates(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  let cursor = parseISO(startIso);
  const end = parseISO(endIso);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(formatIsoDate(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

/** Shift the anchor by one view unit (prev / next). */
export function shiftAnchorDate(
  view: CalendarViewImplemented,
  anchorIso: string,
  direction: -1 | 1,
): string {
  const anchor = parseISO(anchorIso);

  switch (view) {
    case 'day':
      return formatIsoDate(addDays(anchor, direction));
    case 'week':
      return formatIsoDate(addDays(anchor, direction * 7));
    case 'month': {
      const next = new Date(anchor);
      next.setMonth(next.getMonth() + direction);
      return formatIsoDate(next);
    }
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

/** True when the booking closed interval overlaps [rangeStart, rangeEnd]. */
export function bookingOverlapsRange(
  deliveryDate: string,
  returnDate: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return deliveryDate <= rangeEnd && returnDate >= rangeStart;
}

/** Clip a booking interval to the visible calendar range (inclusive). */
export function clipBookingToRange(
  deliveryDate: string,
  returnDate: string,
  rangeStart: string,
  rangeEnd: string,
): CalendarDateRange | null {
  if (!bookingOverlapsRange(deliveryDate, returnDate, rangeStart, rangeEnd)) {
    return null;
  }

  return {
    start: deliveryDate < rangeStart ? rangeStart : deliveryDate,
    end: returnDate > rangeEnd ? rangeEnd : returnDate,
  };
}
