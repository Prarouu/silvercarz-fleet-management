/**
 * URL ↔ VehicleListQuery helpers for the fleet list page.
 */

import { PAGINATION } from '@/constants';
import type { FuelType, SortOrder, VehicleListQuery, VehicleSortField } from '@/types';
import { FUEL_TYPE_VALUES, isFuelType } from '@/types/enums';

const SORT_FIELDS = new Set<VehicleSortField>([
  'vehicle_name',
  'vehicle_number',
  'fuel_type',
  'created_at',
  'updated_at',
]);

/** Availability filter values exposed in the fleet toolbar. */
export const VEHICLE_AVAILABILITY_FILTERS = {
  available: 'available',
  booked: 'booked',
  maintenance: 'maintenance',
} as const;

export type VehicleAvailabilityFilter =
  (typeof VEHICLE_AVAILABILITY_FILTERS)[keyof typeof VEHICLE_AVAILABILITY_FILTERS];

export const VEHICLE_AVAILABILITY_FILTER_OPTIONS: ReadonlyArray<{
  readonly value: VehicleAvailabilityFilter;
  readonly label: string;
}> = [
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' },
];

/** Status filter values exposed in the fleet toolbar. */
export const VEHICLE_STATUS_FILTERS = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type VehicleStatusFilter =
  (typeof VEHICLE_STATUS_FILTERS)[keyof typeof VEHICLE_STATUS_FILTERS];

export type VehicleListUrlState = {
  readonly search: string;
  readonly fuelType: string;
  readonly availability: string;
  readonly status: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortBy: VehicleSortField;
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

function parseSortBy(value: string | undefined): VehicleSortField {
  if (value && SORT_FIELDS.has(value as VehicleSortField)) {
    return value as VehicleSortField;
  }
  return 'created_at';
}

function parseSortOrder(value: string | undefined): SortOrder {
  return value === 'asc' ? 'asc' : 'desc';
}

function isAvailabilityFilter(value: string): value is VehicleAvailabilityFilter {
  return (
    value === VEHICLE_AVAILABILITY_FILTERS.available ||
    value === VEHICLE_AVAILABILITY_FILTERS.booked ||
    value === VEHICLE_AVAILABILITY_FILTERS.maintenance
  );
}

function isStatusFilter(value: string): value is VehicleStatusFilter {
  return value === VEHICLE_STATUS_FILTERS.active || value === VEHICLE_STATUS_FILTERS.inactive;
}

/** Reads Next.js `searchParams` into a normalized list URL state. */
export function parseVehicleListUrlState(
  searchParams: Record<string, string | string[] | undefined>,
): VehicleListUrlState {
  const fuelRaw = firstValue(searchParams.fuelType)?.trim() ?? '';
  const availabilityRaw = firstValue(searchParams.availability)?.trim() ?? '';
  const statusRaw = firstValue(searchParams.status)?.trim() ?? '';

  return {
    search: firstValue(searchParams.q)?.trim() ?? '',
    fuelType: fuelRaw && isFuelType(fuelRaw) && FUEL_TYPE_VALUES.includes(fuelRaw) ? fuelRaw : '',
    availability: availabilityRaw && isAvailabilityFilter(availabilityRaw) ? availabilityRaw : '',
    status: statusRaw && isStatusFilter(statusRaw) ? statusRaw : '',
    page: parsePositiveInt(firstValue(searchParams.page), PAGINATION.defaultPage),
    pageSize: parsePageSize(firstValue(searchParams.pageSize)),
    sortBy: parseSortBy(firstValue(searchParams.sortBy)),
    sortOrder: parseSortOrder(firstValue(searchParams.sortOrder)),
  };
}

/**
 * Previously reserved for future availability backends. Kept for call-site
 * compatibility — all availability filters are queryable via
 * `availability_status` now.
 */
export function isFutureAvailabilityFilter(_state: VehicleListUrlState): boolean {
  return false;
}

/**
 * Maps URL state to the vehicle service list query.
 *
 * Fleet list always opts into inactive rows (`includeInactive`) unless a
 * status filter narrows to active/inactive explicitly.
 */
export function toVehicleListQuery(state: VehicleListUrlState): VehicleListQuery {
  const fuelType: FuelType | undefined =
    state.fuelType && isFuelType(state.fuelType) ? state.fuelType : undefined;

  const base: VehicleListQuery = {
    search: state.search || undefined,
    fuelType,
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    includeInactive: true,
  };

  let query: VehicleListQuery = base;

  if (state.status === VEHICLE_STATUS_FILTERS.active) {
    query = { ...query, isActive: true };
  } else if (state.status === VEHICLE_STATUS_FILTERS.inactive) {
    query = { ...query, isActive: false };
  }

  if (state.availability === VEHICLE_AVAILABILITY_FILTERS.available) {
    return { ...query, available: true };
  }

  if (
    state.availability === VEHICLE_AVAILABILITY_FILTERS.booked ||
    state.availability === VEHICLE_AVAILABILITY_FILTERS.maintenance
  ) {
    return {
      ...query,
      availabilityStatus: state.availability,
    };
  }

  return query;
}

/** True when any user-facing filter/search is active (for empty-state copy). */
export function hasActiveVehicleListFilters(state: VehicleListUrlState): boolean {
  return Boolean(state.search || state.fuelType || state.availability || state.status);
}

/** Builds a query string from partial URL updates (omits defaults). */
export function buildVehicleListSearchParams(
  state: VehicleListUrlState,
  updates: Partial<VehicleListUrlState> = {},
): string {
  const next: VehicleListUrlState = { ...state, ...updates };
  const params = new URLSearchParams();

  if (next.search) {
    params.set('q', next.search);
  }
  if (next.fuelType) {
    params.set('fuelType', next.fuelType);
  }
  if (next.availability) {
    params.set('availability', next.availability);
  }
  if (next.status) {
    params.set('status', next.status);
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
