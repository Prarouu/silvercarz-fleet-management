/**
 * Fleet Availability Calendar service.
 *
 * Orchestrates Booking Repository (range-scoped loads), Vehicle Repository,
 * Availability Engine, Status Engine, and Pricing Engine.
 * Does not reimplement overlap, lifecycle, or availability rules.
 */

import 'server-only';

import {
  createBookingRepository,
  getBookingRepository,
  type BookingRepository,
} from '@/features/bookings/repository';
import {
  countBookingsByDisplayStatus,
  getBookingStatusPresentation,
  isScheduleBlockingBooking,
  resolveBookingDisplayStatus,
} from '@/features/bookings/service/status.service';
import {
  filterEventsByDisplayStatus,
  toCalendarEvent,
} from '@/features/calendar/lib/calendar-events';
import { clipBookingToRange, todayIsoDate } from '@/features/calendar/lib/calendar-range';
import type {
  CalendarPageData,
  CalendarQuery,
  CalendarSummary,
  CalendarVehicleOption,
  FleetOccupancyBlock,
  FleetTimelineRow,
} from '@/features/calendar/types';
import {
  createVehicleRepository,
  getVehicleRepository,
  type VehicleRepository,
} from '@/features/vehicles/repository';
import { resolveAvailabilityFromBookings } from '@/features/vehicles/service/availability.service';
import { PERMISSIONS, requirePermission } from '@/lib/auth';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { fromPromise } from '@/services';
import type { ApiResponse, BookingWithVehicle, Vehicle } from '@/types';
import { VEHICLE_AVAILABILITY_STATUSES } from '@/types/enums';

export interface CalendarServiceDeps {
  readonly bookingRepository?: BookingRepository;
  readonly vehicleRepository?: VehicleRepository;
  readonly client?: TypedSupabaseClient;
  readonly requirePermission?: typeof requirePermission;
  readonly todayIsoDate?: () => string;
}

export interface CalendarService {
  getCalendarData(query: CalendarQuery): Promise<ApiResponse<CalendarPageData>>;
}

function vehicleOptionLabel(vehicle: Vehicle): string {
  return `${vehicle.vehicle_name} (${vehicle.vehicle_number})`;
}

function buildTimeline(params: {
  readonly vehicles: readonly Vehicle[];
  readonly bookings: readonly BookingWithVehicle[];
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly asOfDate: string;
}): FleetTimelineRow[] {
  const byVehicle = new Map<string, BookingWithVehicle[]>();

  for (const booking of params.bookings) {
    const list = byVehicle.get(booking.vehicle_id) ?? [];
    list.push(booking);
    byVehicle.set(booking.vehicle_id, list);
  }

  return params.vehicles.map((vehicle) => {
    const vehicleBookings = byVehicle.get(vehicle.id) ?? [];
    const blocks: FleetOccupancyBlock[] = [];

    for (const booking of vehicleBookings) {
      const display = resolveBookingDisplayStatus(booking, params.asOfDate);
      if (display === 'cancelled' || display === 'draft') {
        continue;
      }

      const clipped = clipBookingToRange(
        booking.delivery_date,
        booking.return_date,
        params.rangeStart,
        params.rangeEnd,
      );

      if (!clipped) {
        continue;
      }

      if (!isScheduleBlockingBooking(booking, params.asOfDate) && display !== 'completed') {
        continue;
      }

      const presentation = getBookingStatusPresentation(booking, params.asOfDate);
      blocks.push({
        bookingId: booking.id,
        invoiceNumber: booking.invoice_number,
        customerName: booking.customer_name,
        startDate: clipped.start,
        endDate: clipped.end,
        displayStatus: presentation.status,
        statusLabel: presentation.label,
        badgeVariant: presentation.badgeVariant,
      });
    }

    blocks.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.vehicle_name,
      registrationNumber: vehicle.vehicle_number,
      vehicleImagePath: vehicle.image_path,
      availabilityStatus: resolveAvailabilityFromBookings(
        vehicle,
        vehicleBookings,
        params.asOfDate,
      ),
      blocks,
    };
  });
}

async function buildSummary(params: {
  readonly vehicles: readonly Vehicle[];
  readonly bookings: readonly BookingWithVehicle[];
  readonly asOfDate: string;
  readonly vehicleRepo: VehicleRepository;
  readonly useGlobalFleetCounts: boolean;
}): Promise<CalendarSummary> {
  const metrics = countBookingsByDisplayStatus(params.bookings, params.asOfDate);

  let availableVehicles = 0;
  let bookedVehicles = 0;

  if (params.useGlobalFleetCounts) {
    const [availableRes, bookedRes, reservedRes] = await Promise.all([
      params.vehicleRepo.count({ available: true }),
      params.vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.booked }),
      params.vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.reserved }),
    ]);
    availableVehicles = availableRes;
    bookedVehicles = bookedRes + reservedRes;
  } else {
    for (const vehicle of params.vehicles) {
      if (vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.available) {
        availableVehicles += 1;
      }
      if (
        vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.booked ||
        vehicle.availability_status === VEHICLE_AVAILABILITY_STATUSES.reserved
      ) {
        bookedVehicles += 1;
      }
    }
  }

  const todaysPickups = params.bookings.filter((booking) => {
    const status = resolveBookingDisplayStatus(booking, params.asOfDate);
    return (
      status !== 'cancelled' && status !== 'draft' && booking.delivery_date === params.asOfDate
    );
  }).length;

  const todaysReturns = params.bookings.filter((booking) => {
    const status = resolveBookingDisplayStatus(booking, params.asOfDate);
    return status !== 'cancelled' && status !== 'draft' && booking.return_date === params.asOfDate;
  }).length;

  return {
    availableVehicles,
    bookedVehicles,
    todaysPickups,
    todaysReturns,
    activeBookings: metrics.active,
    upcomingBookings: metrics.upcoming,
  };
}

export function createCalendarService(deps: CalendarServiceDeps = {}): CalendarService {
  const requirePerm = deps.requirePermission ?? requirePermission;
  const today = deps.todayIsoDate ?? todayIsoDate;

  async function getBookingsRepo(): Promise<BookingRepository> {
    if (deps.bookingRepository) {
      return deps.bookingRepository;
    }
    if (deps.client) {
      return createBookingRepository(deps.client);
    }
    return getBookingRepository();
  }

  async function getVehiclesRepo(): Promise<VehicleRepository> {
    if (deps.vehicleRepository) {
      return deps.vehicleRepository;
    }
    if (deps.client) {
      return createVehicleRepository(deps.client);
    }
    return getVehicleRepository();
  }

  return {
    getCalendarData(query) {
      return fromPromise(async () => {
        // Auth state is request-cached; both checks share one profile load.
        await Promise.all([
          requirePerm(PERMISSIONS.bookingsRead),
          requirePerm(PERMISSIONS.vehiclesRead),
        ]);

        const asOfDate = today();
        const bookingRepo = await getBookingsRepo();
        const vehicleRepo = await getVehiclesRepo();
        const useGlobalFleetCounts = !query.vehicleId && !query.availability && !query.fuelType;
        const needsUnfilteredVehicleOptions = Boolean(query.availability || query.fuelType);

        // Availability is persisted on booking write paths — no fleet-wide sync here.
        const [fleetResult, unfilteredFleetResult, availableRes, bookedRes, reservedRes] =
          await Promise.all([
            vehicleRepo.list({
              page: 1,
              pageSize: 100,
              includeInactive: false,
              fuelType: query.fuelType,
              availabilityStatus: query.availability,
              sortBy: 'vehicle_name',
              sortOrder: 'asc',
            }),
            needsUnfilteredVehicleOptions
              ? vehicleRepo.list({
                  page: 1,
                  pageSize: 100,
                  includeInactive: false,
                  sortBy: 'vehicle_name',
                  sortOrder: 'asc',
                })
              : Promise.resolve(null),
            useGlobalFleetCounts ? vehicleRepo.count({ available: true }) : Promise.resolve(null),
            useGlobalFleetCounts
              ? vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.booked })
              : Promise.resolve(null),
            useGlobalFleetCounts
              ? vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.reserved })
              : Promise.resolve(null),
          ]);

        let fleet = [...fleetResult.data];

        if (query.vehicleId) {
          fleet = fleet.filter((vehicle) => vehicle.id === query.vehicleId);
          if (fleet.length === 0) {
            const single = await vehicleRepo.findById(query.vehicleId);
            if (single && single.is_active) {
              const matchesFuel = !query.fuelType || single.fuel_type === query.fuelType;
              const matchesAvailability =
                !query.availability || single.availability_status === query.availability;
              if (matchesFuel && matchesAvailability) {
                fleet = [single];
              }
            }
          }
        }

        const vehicleIds = fleet.map((vehicle) => vehicle.id);

        const overlapping =
          vehicleIds.length === 0
            ? []
            : await bookingRepo.findOverlappingInRange({
                deliveryDate: query.rangeStart,
                returnDate: query.rangeEnd,
                vehicleIds,
                driverName: query.driver,
                search: query.search,
                includeCancelled: query.status === 'cancelled',
                excludeDraft: query.status !== 'draft',
                limit: 500,
              });

        let events = overlapping.map((booking) => toCalendarEvent(booking, asOfDate));
        events = filterEventsByDisplayStatus(events, query.status);

        const filteredBookings = overlapping.filter((booking) => {
          if (!query.status) {
            return true;
          }
          return resolveBookingDisplayStatus(booking, asOfDate) === query.status;
        });

        const baseSummary = await buildSummary({
          vehicles: fleet,
          bookings: filteredBookings,
          asOfDate,
          vehicleRepo,
          useGlobalFleetCounts: false,
        });

        const summary: CalendarSummary =
          useGlobalFleetCounts &&
          availableRes !== null &&
          bookedRes !== null &&
          reservedRes !== null
            ? {
                ...baseSummary,
                availableVehicles: availableRes,
                bookedVehicles: bookedRes + reservedRes,
              }
            : baseSummary;

        const timeline = buildTimeline({
          vehicles: fleet,
          bookings: filteredBookings,
          rangeStart: query.rangeStart,
          rangeEnd: query.rangeEnd,
          asOfDate,
        });

        const vehicles: CalendarVehicleOption[] = (
          unfilteredFleetResult?.data ?? fleetResult.data
        ).map((vehicle) => ({
          id: vehicle.id,
          label: vehicleOptionLabel(vehicle),
        }));

        return {
          rangeStart: query.rangeStart,
          rangeEnd: query.rangeEnd,
          asOfDate,
          summary,
          events,
          timeline,
          vehicles,
          fleet,
        } satisfies CalendarPageData;
      });
    },
  };
}

let singleton: CalendarService | null = null;

export function getCalendarService(): CalendarService {
  if (!singleton) {
    singleton = createCalendarService();
  }
  return singleton;
}
