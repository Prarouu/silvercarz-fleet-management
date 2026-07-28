/**
 * Vehicle Availability Engine — centralized business service.
 *
 * Single source of truth for fleet availability states and transitions.
 * Admin booking, customer portal, calendar, reports, and dashboards must
 * call this service — never reimplement rules in UI or ad-hoc queries.
 *
 * Scheduling / conflict detection can extend `checkAvailability` later
 * without changing call sites.
 */

import 'server-only';

import {
  createBookingRepository,
  getBookingRepository,
  type BookingRepository,
} from '@/features/bookings/repository';
import {
  createInvalidAvailabilityStatusError,
  createUnauthorizedVehicleAccessError,
  createVehicleNotFoundError,
  createVehicleUnavailableForBookingError,
  createVehicleValidationError,
} from '@/features/vehicles/errors';
import {
  createVehicleRepository,
  getVehicleRepository,
  type VehicleRepository,
} from '@/features/vehicles/repository';
import { PERMISSIONS, requirePermission } from '@/lib/auth';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { fromPromise } from '@/services';
import type {
  ApiResponse,
  Booking,
  BookingStatus,
  PaginatedResult,
  Vehicle,
  VehicleAvailabilityQuery,
  VehicleAvailabilityStatus,
  VehicleListQuery,
} from '@/types';
import {
  BOOKING_STATUSES,
  VEHICLE_AVAILABILITY_STATUSES,
  VEHICLE_BOOKING_DERIVED_STATUSES,
  isVehicleAvailabilityStatus,
  isVehicleBookableStatus,
} from '@/types/enums';

export interface AvailabilityServiceDeps {
  readonly vehicleRepository?: VehicleRepository;
  readonly bookingRepository?: BookingRepository;
  readonly client?: TypedSupabaseClient;
  /** Optional override for tests; defaults to `requirePermission`. */
  readonly requirePermission?: typeof requirePermission;
  /** Clock override for tests (ISO date `YYYY-MM-DD`). */
  readonly todayIsoDate?: () => string;
}

export interface AvailabilityService {
  /** Read persisted availability for a vehicle. */
  getCurrentAvailability(vehicleId: string): Promise<ApiResponse<VehicleAvailabilityStatus>>;
  /** Explicit staff/admin status update (manual override). */
  updateAvailability(
    vehicleId: string,
    status: VehicleAvailabilityStatus,
  ): Promise<ApiResponse<Vehicle>>;
  /**
   * Whether the vehicle can accept a booking (optionally for a date window).
   * Date-window conflict detection is reserved for a later phase.
   */
  checkAvailability(query: VehicleAvailabilityQuery): Promise<ApiResponse<boolean>>;
  /** Active fleet vehicles currently marked available. */
  getAvailableVehicles(query?: VehicleListQuery): Promise<ApiResponse<PaginatedResult<Vehicle>>>;
  /** Active fleet vehicles that are not available. */
  getUnavailableVehicles(query?: VehicleListQuery): Promise<ApiResponse<PaginatedResult<Vehicle>>>;
  /**
   * Ensures a vehicle is bookable right now.
   * Throws friendly domain errors for maintenance / inactive / booked / reserved.
   */
  assertVehicleBookable(vehicleId: string): Promise<Vehicle>;
  /**
   * Recalculates availability from booking lifecycle and persists when allowed.
   * Preserves manual `maintenance` and roster `inactive` locks.
   */
  syncAvailabilityFromBookings(vehicleId: string): Promise<ApiResponse<Vehicle>>;
  /**
   * Pure transition helper — derives the booking-driven status from open hires.
   * Does not touch the database. Used by sync and future schedulers.
   */
  resolveStatusFromBookings(
    vehicle: Pick<Vehicle, 'is_active' | 'availability_status'>,
    bookings: readonly Booking[],
    asOfDate?: string,
  ): VehicleAvailabilityStatus;
}

const BOOKING_DERIVED_SET = new Set<string>(VEHICLE_BOOKING_DERIVED_STATUSES);

const ACTIVE_HIRE_STATUSES = new Set<BookingStatus>([
  BOOKING_STATUSES.confirmed,
  BOOKING_STATUSES.ongoing,
]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isBookingDerivedStatus(status: VehicleAvailabilityStatus): boolean {
  return BOOKING_DERIVED_SET.has(status);
}

/**
 * Centralized state transitions from booking dates / status.
 *
 * Rules (as-of date):
 * - Soft-retired / inactive roster → inactive
 * - Manual maintenance (when not overwritten by roster) → maintenance
 * - Any active hire covering as-of → booked
 * - Else any future active hire → reserved
 * - Else → available
 *
 * Completed / cancelled / draft bookings never drive reserved/booked.
 */
export function resolveAvailabilityFromBookings(
  vehicle: Pick<Vehicle, 'is_active' | 'availability_status'>,
  bookings: readonly Booking[],
  asOfDate: string = todayIso(),
): VehicleAvailabilityStatus {
  if (
    !vehicle.is_active ||
    vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.inactive
  ) {
    return VEHICLE_AVAILABILITY_STATUSES.inactive;
  }

  if (vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.maintenance) {
    return VEHICLE_AVAILABILITY_STATUSES.maintenance;
  }

  let hasCurrentHire = false;
  let hasFutureHire = false;

  for (const booking of bookings) {
    if (!ACTIVE_HIRE_STATUSES.has(booking.status)) {
      continue;
    }

    if (booking.status === BOOKING_STATUSES.ongoing) {
      hasCurrentHire = true;
      continue;
    }

    // confirmed: use date window relative to as-of
    if (booking.delivery_date <= asOfDate && booking.return_date >= asOfDate) {
      hasCurrentHire = true;
    } else if (booking.delivery_date > asOfDate) {
      hasFutureHire = true;
    }
  }

  if (hasCurrentHire) {
    return VEHICLE_AVAILABILITY_STATUSES.booked;
  }

  if (hasFutureHire) {
    return VEHICLE_AVAILABILITY_STATUSES.reserved;
  }

  return VEHICLE_AVAILABILITY_STATUSES.available;
}

export function createAvailabilityService(deps: AvailabilityServiceDeps = {}): AvailabilityService {
  const requirePerm = deps.requirePermission ?? requirePermission;
  const resolveToday = deps.todayIsoDate ?? todayIso;

  async function getVehicleRepo(): Promise<VehicleRepository> {
    if (deps.vehicleRepository) {
      return deps.vehicleRepository;
    }

    if (deps.client) {
      return createVehicleRepository(deps.client);
    }

    return getVehicleRepository();
  }

  async function getBookingRepo(): Promise<BookingRepository> {
    if (deps.bookingRepository) {
      return deps.bookingRepository;
    }

    if (deps.client) {
      return createBookingRepository(deps.client);
    }

    return getBookingRepository();
  }

  const service: AvailabilityService = {
    resolveStatusFromBookings(vehicle, bookings, asOfDate) {
      return resolveAvailabilityFromBookings(vehicle, bookings, asOfDate ?? resolveToday());
    },

    getCurrentAvailability(vehicleId) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getVehicleRepo();
        const vehicle = await repository.findById(vehicleId);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        return vehicle.availability_status;
      });
    },

    updateAvailability(vehicleId, status) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesWrite);

        if (!isVehicleAvailabilityStatus(status)) {
          throw createInvalidAvailabilityStatusError();
        }

        const repository = await getVehicleRepo();
        const existing = await repository.findById(vehicleId);

        if (!existing) {
          throw createVehicleNotFoundError();
        }

        const patch: {
          availability_status: VehicleAvailabilityStatus;
          is_active?: boolean;
        } = { availability_status: status };

        // Keep roster flag aligned with inactive availability.
        if (status === VEHICLE_AVAILABILITY_STATUSES.inactive) {
          patch.is_active = false;
        } else if (!existing.is_active) {
          patch.is_active = true;
        }

        return repository.update(vehicleId, patch);
      });
    },

    checkAvailability(query) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getVehicleRepo();
        const vehicle = await repository.findById(query.vehicleId);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        if (!vehicle.is_active) {
          return false;
        }

        if (!isVehicleBookableStatus(vehicle.availability_status)) {
          return false;
        }

        // Future: honor deliveryDate / returnDate / excludeBookingId via
        // booking conflict detection. Overlap enforcement remains in BookingService.
        return true;
      });
    },

    getAvailableVehicles(query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getVehicleRepo();
        return repository.list({
          ...query,
          available: true,
          isActive: true,
        });
      });
    },

    getUnavailableVehicles(query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getVehicleRepo();
        const pageSize = query.pageSize ?? 100;
        const page = query.page ?? 1;

        // Fetch active fleet and filter to non-available statuses.
        // Exact multi-status OR filters can move into the repository later.
        const result = await repository.list({
          ...query,
          isActive: true,
          includeInactive: false,
          page,
          pageSize,
        });

        const unavailable = result.data.filter(
          (vehicle) => vehicle.availability_status !== VEHICLE_AVAILABILITY_STATUSES.available,
        );

        return {
          data: unavailable,
          meta: {
            ...result.meta,
            totalItems: unavailable.length,
            totalPages: unavailable.length === 0 ? 0 : 1,
            hasNextPage: false,
            hasPreviousPage: false,
            page: 1,
          },
        };
      });
    },

    async assertVehicleBookable(vehicleId) {
      const repository = await getVehicleRepo();
      const vehicle = await repository.findById(vehicleId);

      if (!vehicle) {
        throw createVehicleNotFoundError();
      }

      if (
        !vehicle.is_active ||
        vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.inactive
      ) {
        throw createVehicleUnavailableForBookingError('inactive');
      }

      if (vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.maintenance) {
        throw createVehicleUnavailableForBookingError('maintenance');
      }

      return vehicle;
    },

    syncAvailabilityFromBookings(vehicleId) {
      return fromPromise(async () => {
        if (!vehicleId.trim()) {
          throw createVehicleValidationError('Vehicle id is required.');
        }

        const vehicleRepository = await getVehicleRepo();
        const bookingRepository = await getBookingRepo();
        const vehicle = await vehicleRepository.findById(vehicleId);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        const bookings = await bookingRepository.findLifecycleBookingsForVehicle(vehicleId);
        const nextStatus = resolveAvailabilityFromBookings(vehicle, bookings, resolveToday());

        // Never clobber an explicit maintenance lock via booking sync unless
        // the vehicle was already on a booking-derived status (or inactive roster).
        if (
          vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.maintenance &&
          nextStatus !== VEHICLE_AVAILABILITY_STATUSES.maintenance &&
          nextStatus !== VEHICLE_AVAILABILITY_STATUSES.inactive
        ) {
          return vehicle;
        }

        if (vehicle.availability_status === nextStatus) {
          return vehicle;
        }

        // Only auto-write booking-derived statuses (and inactive from soft-retire sync).
        if (
          !isBookingDerivedStatus(nextStatus) &&
          nextStatus !== VEHICLE_AVAILABILITY_STATUSES.inactive &&
          nextStatus !== VEHICLE_AVAILABILITY_STATUSES.maintenance
        ) {
          return vehicle;
        }

        return vehicleRepository.update(vehicleId, {
          availability_status: nextStatus,
        });
      });
    },
  };

  return service;
}

/** Default request-scoped availability engine. */
export function getAvailabilityService(): AvailabilityService {
  return createAvailabilityService();
}

/** Exported for rare cases where a caller needs an explicit unauthorized error. */
export { createUnauthorizedVehicleAccessError };
