/**
 * Booking Status Automation Engine — centralized lifecycle determination.
 *
 * Single source of truth for display status, badge presentation, and the
 * persisted DB status used by Conflict / Availability indexes.
 *
 * UI must never reimplement these rules — import helpers from this module.
 * Pure functions (no `server-only`) so list/detail client surfaces can render
 * badges without duplicating date logic.
 */

import type { BookingStatus, SelectOption } from '@/types';
import { BOOKING_STATUSES } from '@/types/enums';

/** Lifecycle statuses — always computed from delivery / return dates. */
export const BOOKING_LIFECYCLE_STATUSES = {
  upcoming: 'upcoming',
  active: 'active',
  completed: 'completed',
} as const;

/** Terminal statuses — stored; override lifecycle calculation. */
export const BOOKING_TERMINAL_STATUSES = {
  cancelled: 'cancelled',
  /** Future-ready — not in Postgres enum yet. */
  no_show: 'no_show',
  /** Future-ready — not in Postgres enum yet. */
  closed: 'closed',
} as const;

/**
 * Full display status surface (lifecycle + terminal + draft).
 * Draft remains a special pre-commit state (stored, not date-derived).
 */
export const BOOKING_DISPLAY_STATUSES = {
  ...BOOKING_LIFECYCLE_STATUSES,
  ...BOOKING_TERMINAL_STATUSES,
  draft: 'draft',
} as const;

export type BookingLifecycleStatus =
  (typeof BOOKING_LIFECYCLE_STATUSES)[keyof typeof BOOKING_LIFECYCLE_STATUSES];

export type BookingTerminalStatus =
  (typeof BOOKING_TERMINAL_STATUSES)[keyof typeof BOOKING_TERMINAL_STATUSES];

export type BookingDisplayStatus =
  (typeof BOOKING_DISPLAY_STATUSES)[keyof typeof BOOKING_DISPLAY_STATUSES];

export const BOOKING_DISPLAY_STATUS_VALUES = [
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
  BOOKING_DISPLAY_STATUSES.completed,
  BOOKING_DISPLAY_STATUSES.cancelled,
  BOOKING_DISPLAY_STATUSES.draft,
  BOOKING_DISPLAY_STATUSES.no_show,
  BOOKING_DISPLAY_STATUSES.closed,
] as const satisfies readonly BookingDisplayStatus[];

export const BOOKING_DISPLAY_STATUS_LABELS: Record<BookingDisplayStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  draft: 'Draft',
  no_show: 'No show',
  closed: 'Closed',
};

export const BOOKING_DISPLAY_STATUS_DESCRIPTIONS: Record<BookingDisplayStatus, string> = {
  upcoming: 'Delivery has not started yet. The vehicle is reserved for this hire.',
  active: 'The rental is in progress (delivery through return day inclusive).',
  completed: 'The return date has passed. This hire is finished.',
  cancelled: 'This booking was cancelled and no longer occupies the vehicle calendar.',
  draft: 'Draft booking — not yet confirmed on the vehicle calendar.',
  no_show: 'Customer did not take delivery (terminal). Reserved for a future release.',
  closed: 'Administratively closed (terminal). Reserved for a future release.',
};

/**
 * Shared Badge `variant` tokens (aligned with `@/components/ui/badge`).
 * Never hardcode colors in UI — pass these through `<Badge variant={…}>`.
 */
export type BookingStatusBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'link';

/**
 * Example palette (via design-system Badge variants):
 * Upcoming → info (blue), Active → success (green),
 * Completed → secondary (gray), Cancelled → destructive (red).
 */
export const BOOKING_DISPLAY_STATUS_BADGE_VARIANTS: Record<
  BookingDisplayStatus,
  BookingStatusBadgeVariant
> = {
  upcoming: 'info',
  active: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  draft: 'outline',
  no_show: 'warning',
  closed: 'secondary',
};

/** Filter / select options for lifecycle + cancelled (omit future-only terminals). */
export const BOOKING_DISPLAY_STATUS_OPTIONS: SelectOption<BookingDisplayStatus>[] = [
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
  BOOKING_DISPLAY_STATUSES.completed,
  BOOKING_DISPLAY_STATUSES.cancelled,
  BOOKING_DISPLAY_STATUSES.draft,
].map((value) => ({
  value,
  label: BOOKING_DISPLAY_STATUS_LABELS[value],
}));

export type BookingStatusKind = 'lifecycle' | 'terminal' | 'draft';

/** Full presentation model for badges, detail copy, and metrics. */
export interface BookingStatusPresentation {
  readonly status: BookingDisplayStatus;
  readonly label: string;
  readonly description: string;
  readonly badgeVariant: BookingStatusBadgeVariant;
  readonly kind: BookingStatusKind;
  /** Persisted `booking_status` enum value for DB writes / indexes. */
  readonly persistedStatus: BookingStatus;
  /** True when dates drive the status (not a terminal / draft override). */
  readonly isComputed: boolean;
}

/** Minimal booking shape required for status resolution. */
export interface BookingStatusInput {
  readonly status?: BookingStatus | string | null;
  readonly delivery_date: string;
  readonly return_date: string;
}

export interface BookingStatusMetrics {
  readonly upcoming: number;
  readonly active: number;
  readonly completed: number;
  readonly cancelled: number;
  readonly draft: number;
  readonly other: number;
  readonly total: number;
}

const DISPLAY_STATUS_SET = new Set<string>(BOOKING_DISPLAY_STATUS_VALUES);

const TERMINAL_STORED = new Set<string>([
  BOOKING_STATUSES.cancelled,
  BOOKING_TERMINAL_STATUSES.no_show,
  BOOKING_TERMINAL_STATUSES.closed,
]);

/** Display statuses that occupy the vehicle schedule (Conflict / Availability). */
const SCHEDULE_BLOCKING_DISPLAY = new Set<BookingDisplayStatus>([
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
]);

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isBookingDisplayStatus(value: unknown): value is BookingDisplayStatus {
  return typeof value === 'string' && DISPLAY_STATUS_SET.has(value);
}

export function isTerminalStoredStatus(status: string | null | undefined): boolean {
  return typeof status === 'string' && TERMINAL_STORED.has(status);
}

/**
 * Maps a display / lifecycle status onto the Postgres `booking_status` enum.
 * Lifecycle → confirmed / ongoing / completed; terminals pass through when supported.
 */
export function toPersistedBookingStatus(display: BookingDisplayStatus): BookingStatus {
  switch (display) {
    case BOOKING_DISPLAY_STATUSES.upcoming:
      return BOOKING_STATUSES.confirmed;
    case BOOKING_DISPLAY_STATUSES.active:
      return BOOKING_STATUSES.ongoing;
    case BOOKING_DISPLAY_STATUSES.completed:
      return BOOKING_STATUSES.completed;
    case BOOKING_DISPLAY_STATUSES.cancelled:
      return BOOKING_STATUSES.cancelled;
    case BOOKING_DISPLAY_STATUSES.draft:
      return BOOKING_STATUSES.draft;
    case BOOKING_DISPLAY_STATUSES.no_show:
    case BOOKING_DISPLAY_STATUSES.closed:
      // Future terminals — persist as cancelled until the enum is extended.
      return BOOKING_STATUSES.cancelled;
    default: {
      const _exhaustive: never = display;
      return _exhaustive;
    }
  }
}

/**
 * Pure lifecycle from dates (no terminal override).
 *
 * Window is inclusive of the return day so same-day hires stay ACTIVE and
 * stay aligned with the Availability Engine's closed date interval.
 *
 * - current < delivery → UPCOMING
 * - delivery ≤ current ≤ return → ACTIVE
 * - current > return → COMPLETED
 */
export function resolveLifecycleStatus(
  deliveryDate: string,
  returnDate: string,
  asOfDate: string = todayIsoDate(),
): BookingLifecycleStatus {
  if (!deliveryDate || !returnDate) {
    throw new Error('Delivery and return dates are required to resolve booking status.');
  }

  if (returnDate < deliveryDate) {
    throw new Error('Return date must be on or after the delivery date.');
  }

  if (asOfDate < deliveryDate) {
    return BOOKING_LIFECYCLE_STATUSES.upcoming;
  }

  if (asOfDate <= returnDate) {
    return BOOKING_LIFECYCLE_STATUSES.active;
  }

  return BOOKING_LIFECYCLE_STATUSES.completed;
}

/**
 * Determine display status.
 *
 * Precedence:
 * 1. Terminal stored status (cancelled / future no_show / closed) → always wins
 * 2. Draft → draft (not date-derived)
 * 3. Else compute lifecycle from delivery / return vs as-of date
 */
export function resolveBookingDisplayStatus(
  booking: BookingStatusInput,
  asOfDate: string = todayIsoDate(),
): BookingDisplayStatus {
  const stored = booking.status ?? null;

  if (stored === BOOKING_STATUSES.cancelled || stored === BOOKING_TERMINAL_STATUSES.cancelled) {
    return BOOKING_DISPLAY_STATUSES.cancelled;
  }

  if (stored === BOOKING_TERMINAL_STATUSES.no_show) {
    return BOOKING_DISPLAY_STATUSES.no_show;
  }

  if (stored === BOOKING_TERMINAL_STATUSES.closed) {
    return BOOKING_DISPLAY_STATUSES.closed;
  }

  if (stored === BOOKING_STATUSES.draft) {
    return BOOKING_DISPLAY_STATUSES.draft;
  }

  return resolveLifecycleStatus(booking.delivery_date, booking.return_date, asOfDate);
}

export function getBookingStatusPresentation(
  booking: BookingStatusInput,
  asOfDate: string = todayIsoDate(),
): BookingStatusPresentation {
  const status = resolveBookingDisplayStatus(booking, asOfDate);
  const kind: BookingStatusKind =
    status === BOOKING_DISPLAY_STATUSES.draft
      ? 'draft'
      : status === BOOKING_DISPLAY_STATUSES.cancelled ||
          status === BOOKING_DISPLAY_STATUSES.no_show ||
          status === BOOKING_DISPLAY_STATUSES.closed
        ? 'terminal'
        : 'lifecycle';

  return {
    status,
    label: BOOKING_DISPLAY_STATUS_LABELS[status],
    description: BOOKING_DISPLAY_STATUS_DESCRIPTIONS[status],
    badgeVariant: BOOKING_DISPLAY_STATUS_BADGE_VARIANTS[status],
    kind,
    persistedStatus: toPersistedBookingStatus(status),
    isComputed: kind === 'lifecycle',
  };
}

/**
 * Persisted status that should be written on create / update.
 * Terminal cancelled (and draft) are preserved; lifecycle is recomputed.
 */
export function resolvePersistedBookingStatus(
  booking: BookingStatusInput,
  asOfDate: string = todayIsoDate(),
): BookingStatus {
  return getBookingStatusPresentation(booking, asOfDate).persistedStatus;
}

/** Whether this booking occupies the vehicle calendar for Conflict / Availability. */
export function isScheduleBlockingBooking(
  booking: BookingStatusInput,
  asOfDate: string = todayIsoDate(),
): boolean {
  const display = resolveBookingDisplayStatus(booking, asOfDate);
  return SCHEDULE_BLOCKING_DISPLAY.has(display);
}

export function isScheduleBlockingDisplayStatus(status: BookingDisplayStatus): boolean {
  return SCHEDULE_BLOCKING_DISPLAY.has(status);
}

/**
 * Aggregate counts for dashboard metrics.
 * Uses Status Service rules — never count raw DB enum rows without resolving.
 */
export function countBookingsByDisplayStatus(
  bookings: readonly BookingStatusInput[],
  asOfDate: string = todayIsoDate(),
): BookingStatusMetrics {
  let upcoming = 0;
  let active = 0;
  let completed = 0;
  let cancelled = 0;
  let draft = 0;
  let other = 0;

  for (const booking of bookings) {
    const status = resolveBookingDisplayStatus(booking, asOfDate);
    switch (status) {
      case BOOKING_DISPLAY_STATUSES.upcoming:
        upcoming += 1;
        break;
      case BOOKING_DISPLAY_STATUSES.active:
        active += 1;
        break;
      case BOOKING_DISPLAY_STATUSES.completed:
        completed += 1;
        break;
      case BOOKING_DISPLAY_STATUSES.cancelled:
        cancelled += 1;
        break;
      case BOOKING_DISPLAY_STATUSES.draft:
        draft += 1;
        break;
      default:
        other += 1;
        break;
    }
  }

  return {
    upcoming,
    active,
    completed,
    cancelled,
    draft,
    other,
    total: bookings.length,
  };
}

/**
 * Status Service façade (mirrors other booking engines).
 * Prefer named pure exports for UI; use the service object in server orchestration.
 */
export interface BookingStatusService {
  resolveDisplayStatus(booking: BookingStatusInput, asOfDate?: string): BookingDisplayStatus;
  getPresentation(booking: BookingStatusInput, asOfDate?: string): BookingStatusPresentation;
  resolvePersistedStatus(booking: BookingStatusInput, asOfDate?: string): BookingStatus;
  isScheduleBlocking(booking: BookingStatusInput, asOfDate?: string): boolean;
  countByDisplayStatus(
    bookings: readonly BookingStatusInput[],
    asOfDate?: string,
  ): BookingStatusMetrics;
}

export interface BookingStatusServiceDeps {
  /** Clock override for tests (ISO date `YYYY-MM-DD`). */
  readonly todayIsoDate?: () => string;
}

export function createBookingStatusService(
  deps: BookingStatusServiceDeps = {},
): BookingStatusService {
  const resolveToday = deps.todayIsoDate ?? todayIsoDate;

  return {
    resolveDisplayStatus(booking, asOfDate) {
      return resolveBookingDisplayStatus(booking, asOfDate ?? resolveToday());
    },
    getPresentation(booking, asOfDate) {
      return getBookingStatusPresentation(booking, asOfDate ?? resolveToday());
    },
    resolvePersistedStatus(booking, asOfDate) {
      return resolvePersistedBookingStatus(booking, asOfDate ?? resolveToday());
    },
    isScheduleBlocking(booking, asOfDate) {
      return isScheduleBlockingBooking(booking, asOfDate ?? resolveToday());
    },
    countByDisplayStatus(bookings, asOfDate) {
      return countBookingsByDisplayStatus(bookings, asOfDate ?? resolveToday());
    },
  };
}

/** Default status engine (system clock). */
export function getBookingStatusService(): BookingStatusService {
  return createBookingStatusService();
}
