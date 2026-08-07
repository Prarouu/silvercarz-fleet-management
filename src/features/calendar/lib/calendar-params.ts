/**
 * URL ↔ CalendarQuery helpers for the Fleet Calendar page.
 */

import {
  CALENDAR_VIEWS,
  type CalendarQuery,
  type CalendarViewImplemented,
} from '@/features/calendar/types';
import {
  isIsoDate,
  resolveCalendarRange,
  todayIsoDate,
} from '@/features/calendar/lib/calendar-range';
import {
  BOOKING_DISPLAY_STATUSES,
  isBookingDisplayStatus,
  type BookingDisplayStatus,
} from '@/features/bookings/service/status.service';
import type { FuelType, VehicleAvailabilityStatus } from '@/types';
import {
  FUEL_TYPE_VALUES,
  isFuelType,
  isVehicleAvailabilityStatus,
  VEHICLE_AVAILABILITY_STATUS_VALUES,
} from '@/types/enums';

export type CalendarUrlState = {
  readonly view: CalendarViewImplemented;
  readonly date: string;
  readonly search: string;
  readonly vehicleId: string;
  readonly availability: string;
  readonly status: string;
  readonly driver: string;
  readonly fuelType: string;
  readonly from: string;
  readonly to: string;
};

const IMPLEMENTED_VIEWS = new Set<CalendarViewImplemented>([
  CALENDAR_VIEWS.day,
  CALENDAR_VIEWS.week,
  CALENDAR_VIEWS.month,
]);

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseView(value: string | undefined): CalendarViewImplemented {
  if (value && IMPLEMENTED_VIEWS.has(value as CalendarViewImplemented)) {
    return value as CalendarViewImplemented;
  }
  return CALENDAR_VIEWS.week;
}

export function parseCalendarUrlState(
  params: Record<string, string | string[] | undefined>,
): CalendarUrlState {
  const dateRaw = firstValue(params.date);
  const fromRaw = firstValue(params.from);
  const toRaw = firstValue(params.to);

  return {
    view: parseView(firstValue(params.view)),
    date: isIsoDate(dateRaw) ? dateRaw : todayIsoDate(),
    search: firstValue(params.q)?.trim() ?? '',
    vehicleId: firstValue(params.vehicleId)?.trim() ?? '',
    availability: firstValue(params.availability)?.trim() ?? '',
    status: firstValue(params.status)?.trim() ?? '',
    driver: firstValue(params.driver)?.trim() ?? '',
    fuelType: firstValue(params.fuelType)?.trim() ?? '',
    from: isIsoDate(fromRaw) ? fromRaw : '',
    to: isIsoDate(toRaw) ? toRaw : '',
  };
}

export function toCalendarQuery(state: CalendarUrlState): CalendarQuery {
  const range = resolveCalendarRange({
    view: state.view,
    date: state.date,
    from: state.from || undefined,
    to: state.to || undefined,
  });

  const status =
    state.status && isBookingDisplayStatus(state.status)
      ? (state.status as BookingDisplayStatus)
      : undefined;

  const fuelType =
    state.fuelType && isFuelType(state.fuelType) ? (state.fuelType as FuelType) : undefined;

  const availability =
    state.availability && isVehicleAvailabilityStatus(state.availability)
      ? (state.availability as VehicleAvailabilityStatus)
      : undefined;

  return {
    view: state.view,
    date: state.date,
    rangeStart: range.start,
    rangeEnd: range.end,
    search: state.search || undefined,
    vehicleId: state.vehicleId || undefined,
    availability,
    status,
    driver: state.driver || undefined,
    fuelType,
    from: state.from || undefined,
    to: state.to || undefined,
  };
}

export function buildCalendarSearchParams(
  state: CalendarUrlState,
  updates: Partial<CalendarUrlState> = {},
): string {
  const next: CalendarUrlState = { ...state, ...updates };
  const params = new URLSearchParams();

  if (next.view !== CALENDAR_VIEWS.week) {
    params.set('view', next.view);
  }

  if (next.date !== todayIsoDate()) {
    params.set('date', next.date);
  }

  if (next.search) {
    params.set('q', next.search);
  }

  if (next.vehicleId) {
    params.set('vehicleId', next.vehicleId);
  }

  if (next.availability) {
    params.set('availability', next.availability);
  }

  if (next.status) {
    params.set('status', next.status);
  }

  if (next.driver) {
    params.set('driver', next.driver);
  }

  if (next.fuelType) {
    params.set('fuelType', next.fuelType);
  }

  if (next.from) {
    params.set('from', next.from);
  }

  if (next.to) {
    params.set('to', next.to);
  }

  return params.toString();
}

export function hasActiveCalendarFilters(state: CalendarUrlState): boolean {
  return Boolean(
    state.search ||
    state.vehicleId ||
    state.availability ||
    state.status ||
    state.driver ||
    state.fuelType ||
    state.from ||
    state.to,
  );
}

export const CALENDAR_STATUS_FILTER_OPTIONS = [
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
  BOOKING_DISPLAY_STATUSES.completed,
  BOOKING_DISPLAY_STATUSES.cancelled,
  BOOKING_DISPLAY_STATUSES.denied,
] as const;

export const CALENDAR_FUEL_FILTER_VALUES = FUEL_TYPE_VALUES;
export const CALENDAR_AVAILABILITY_FILTER_VALUES = VEHICLE_AVAILABILITY_STATUS_VALUES;
