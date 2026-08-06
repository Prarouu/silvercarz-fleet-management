/**
 * URL ↔ BookingListQuery helpers for the bookings list page.
 */

import { PAGINATION } from '@/constants';
import {
  BOOKING_DISPLAY_STATUSES,
  isBookingDisplayStatus,
} from '@/features/bookings/service/status.service';
import type { BookingListQuery, BookingSortField, SortOrder } from '@/types';
import { RENTAL_MODE_VALUES, isBookingStatus, isRentalMode } from '@/types/enums';

const SORT_FIELDS = new Set<BookingSortField>([
  'invoice_date',
  'delivery_date',
  'return_date',
  'created_at',
  'customer_name',
  'invoice_number',
]);

/** Primary admin queues — pending requests vs confirmed fleet bookings. */
export const BOOKING_LIST_VIEWS = {
  pending: 'pending',
  confirmed: 'confirmed',
} as const;

export type BookingListView = (typeof BOOKING_LIST_VIEWS)[keyof typeof BOOKING_LIST_VIEWS];

export const BOOKING_LIST_VIEW_VALUES = [
  BOOKING_LIST_VIEWS.pending,
  BOOKING_LIST_VIEWS.confirmed,
] as const satisfies readonly BookingListView[];

/** Default landing queue — customer requests waiting for admin review. */
export const DEFAULT_BOOKING_LIST_VIEW: BookingListView = BOOKING_LIST_VIEWS.pending;

/** Display statuses offered in the confirmed-queue status filter. */
const CONFIRMED_LIST_FILTER_STATUSES = new Set<string>([
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
  BOOKING_DISPLAY_STATUSES.completed,
  BOOKING_DISPLAY_STATUSES.cancelled,
  BOOKING_DISPLAY_STATUSES.denied,
]);

/** Draft-only statuses accepted when the pending queue is active. */
const PENDING_LIST_FILTER_STATUSES = new Set<string>([BOOKING_DISPLAY_STATUSES.draft]);

export type BookingListUrlState = {
  readonly view: BookingListView;
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

function parseView(value: string | undefined): BookingListView {
  if (value === BOOKING_LIST_VIEWS.confirmed) {
    return BOOKING_LIST_VIEWS.confirmed;
  }
  if (value === BOOKING_LIST_VIEWS.pending) {
    return BOOKING_LIST_VIEWS.pending;
  }
  // Legacy deep-links with ?status=draft open the pending queue.
  return DEFAULT_BOOKING_LIST_VIEW;
}

function parseStatusFilter(value: string | undefined, view: BookingListView): string {
  if (!value) {
    return view === BOOKING_LIST_VIEWS.pending ? BOOKING_DISPLAY_STATUSES.draft : '';
  }

  if (view === BOOKING_LIST_VIEWS.pending) {
    if (PENDING_LIST_FILTER_STATUSES.has(value) && isBookingDisplayStatus(value)) {
      return value;
    }
    if (value === 'draft' || (isBookingStatus(value) && value === 'draft')) {
      return BOOKING_DISPLAY_STATUSES.draft;
    }
    return BOOKING_DISPLAY_STATUSES.draft;
  }

  if (CONFIRMED_LIST_FILTER_STATUSES.has(value) && isBookingDisplayStatus(value)) {
    return value;
  }

  // Legacy persisted-enum URLs still accepted on the confirmed queue.
  if (isBookingStatus(value) && value !== 'draft') {
    return value;
  }

  return '';
}

/** Reads Next.js `searchParams` into a normalized list URL state. */
export function parseBookingListUrlState(
  searchParams: Record<string, string | string[] | undefined>,
): BookingListUrlState {
  const statusRaw = firstValue(searchParams.status)?.trim() ?? '';
  const modeRaw = firstValue(searchParams.mode)?.trim() ?? '';
  const viewRaw = firstValue(searchParams.view)?.trim() ?? '';

  // Legacy ?status=draft without view → pending tab.
  const view =
    !viewRaw && statusRaw === BOOKING_DISPLAY_STATUSES.draft
      ? BOOKING_LIST_VIEWS.pending
      : !viewRaw && statusRaw && statusRaw !== BOOKING_DISPLAY_STATUSES.draft
        ? BOOKING_LIST_VIEWS.confirmed
        : parseView(viewRaw || undefined);

  return {
    view,
    search: firstValue(searchParams.q)?.trim() ?? '',
    status: parseStatusFilter(statusRaw, view),
    mode: modeRaw && isRentalMode(modeRaw) && RENTAL_MODE_VALUES.includes(modeRaw) ? modeRaw : '',
    page: parsePositiveInt(firstValue(searchParams.page), PAGINATION.defaultPage),
    pageSize: parsePageSize(firstValue(searchParams.pageSize)),
    sortBy: parseSortBy(firstValue(searchParams.sortBy)),
    sortOrder: parseSortOrder(firstValue(searchParams.sortOrder)),
  };
}

/** Maps URL state to the booking service list query. */
export function toBookingListQuery(state: BookingListUrlState): BookingListQuery {
  if (state.view === BOOKING_LIST_VIEWS.pending) {
    return {
      search: state.search || undefined,
      status: BOOKING_DISPLAY_STATUSES.draft,
      mode: state.mode && isRentalMode(state.mode) ? state.mode : undefined,
      page: state.page,
      pageSize: state.pageSize,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    };
  }

  const status = state.status || undefined;

  return {
    search: state.search || undefined,
    status: status as BookingListQuery['status'],
    mode: state.mode && isRentalMode(state.mode) ? state.mode : undefined,
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    includeCancelled:
      state.status === BOOKING_DISPLAY_STATUSES.cancelled ||
      state.status === BOOKING_DISPLAY_STATUSES.denied
        ? true
        : undefined,
    excludeDraft: status ? undefined : true,
  };
}

/** True when any user-facing filter/search is active (for empty-state copy). */
export function hasActiveBookingListFilters(state: BookingListUrlState): boolean {
  if (state.search || state.mode) {
    return true;
  }

  if (state.view === BOOKING_LIST_VIEWS.confirmed && state.status) {
    return true;
  }

  return false;
}

/** Builds a query string from partial URL updates (omits defaults). */
export function buildBookingListSearchParams(
  state: BookingListUrlState,
  updates: Partial<BookingListUrlState> = {},
): string {
  const switchingView = Boolean(updates.view && updates.view !== state.view);

  const next: BookingListUrlState = {
    ...state,
    ...updates,
    page: switchingView ? (updates.page ?? 1) : (updates.page ?? state.page),
    status: switchingView
      ? (updates.status ??
        (updates.view === BOOKING_LIST_VIEWS.pending ? BOOKING_DISPLAY_STATUSES.draft : ''))
      : (updates.status ?? state.status),
  };

  const params = new URLSearchParams();

  if (next.view !== DEFAULT_BOOKING_LIST_VIEW) {
    params.set('view', next.view);
  }
  if (next.search) {
    params.set('q', next.search);
  }
  // Pending queue always means draft — omit redundant status=draft from the URL.
  if (next.view === BOOKING_LIST_VIEWS.confirmed && next.status) {
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
