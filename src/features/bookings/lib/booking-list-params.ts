/**
 * URL ↔ BookingListQuery helpers for the bookings list page.
 */

import { PAGINATION } from '@/constants';
import type { BookingListQuery, BookingSortField, SortOrder } from '@/types';
import {
  BOOKING_STATUS_VALUES,
  RENTAL_MODE_VALUES,
  isBookingStatus,
  isRentalMode,
} from '@/types/enums';

const SORT_FIELDS = new Set<BookingSortField>([
  'invoice_date',
  'delivery_date',
  'return_date',
  'created_at',
  'customer_name',
  'invoice_number',
]);

export type BookingListUrlState = {
  readonly search: string;
  readonly status: string;
  readonly mode: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortBy: BookingSortField;
  readonly sortOrder: SortOrder;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePageSize(value: string | undefined): number {
  const parsed = parsePositiveInt(value, PAGINATION.defaultPageSize);
  return (PAGINATION.pageSizeOptions as readonly number[]).includes(parsed)
    ? parsed
    : PAGINATION.defaultPageSize;
}

function parseSortBy(value: string | undefined): BookingSortField {
  if (value && SORT_FIELDS.has(value as BookingSortField)) {
    return value as BookingSortField;
  }
  return 'created_at';
}

function parseSortOrder(value: string | undefined): SortOrder {
  return value === 'asc' ? 'asc' : 'desc';
}

/** Reads Next.js `searchParams` into a normalized list URL state. */
export function parseBookingListUrlState(
  searchParams: Record<string, string | string[] | undefined>,
): BookingListUrlState {
  const statusRaw = firstValue(searchParams.status)?.trim() ?? '';
  const modeRaw = firstValue(searchParams.mode)?.trim() ?? '';

  return {
    search: firstValue(searchParams.q)?.trim() ?? '',
    status:
      statusRaw && isBookingStatus(statusRaw) && BOOKING_STATUS_VALUES.includes(statusRaw)
        ? statusRaw
        : '',
    mode: modeRaw && isRentalMode(modeRaw) && RENTAL_MODE_VALUES.includes(modeRaw) ? modeRaw : '',
    page: parsePositiveInt(firstValue(searchParams.page), PAGINATION.defaultPage),
    pageSize: parsePageSize(firstValue(searchParams.pageSize)),
    sortBy: parseSortBy(firstValue(searchParams.sortBy)),
    sortOrder: parseSortOrder(firstValue(searchParams.sortOrder)),
  };
}

/** Maps URL state to the booking service list query. */
export function toBookingListQuery(state: BookingListUrlState): BookingListQuery {
  return {
    search: state.search || undefined,
    status: state.status && isBookingStatus(state.status) ? state.status : undefined,
    mode: state.mode && isRentalMode(state.mode) ? state.mode : undefined,
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    includeCancelled: state.status === 'cancelled' ? true : undefined,
  };
}

/** True when any user-facing filter/search is active (for empty-state copy). */
export function hasActiveBookingListFilters(state: BookingListUrlState): boolean {
  return Boolean(state.search || state.status || state.mode);
}

/** Builds a query string from partial URL updates (omits defaults). */
export function buildBookingListSearchParams(
  state: BookingListUrlState,
  updates: Partial<BookingListUrlState> = {},
): string {
  const next: BookingListUrlState = { ...state, ...updates };
  const params = new URLSearchParams();

  if (next.search) {
    params.set('q', next.search);
  }
  if (next.status) {
    params.set('status', next.status);
  }
  if (next.mode) {
    params.set('mode', next.mode);
  }
  if (next.page > 1) {
    params.set('page', String(next.page));
  }
  if (next.pageSize !== PAGINATION.defaultPageSize) {
    params.set('pageSize', String(next.pageSize));
  }
  if (next.sortBy !== 'created_at') {
    params.set('sortBy', next.sortBy);
  }
  if (next.sortOrder !== 'desc') {
    params.set('sortOrder', next.sortOrder);
  }

  return params.toString();
}
