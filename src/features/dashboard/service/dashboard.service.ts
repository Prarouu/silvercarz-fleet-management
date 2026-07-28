/**
 * Admin Dashboard service.
 *
 * Aggregates Booking Repository, Vehicle Repository, Availability Engine,
 * and Status Engine into a single dashboard read model.
 * Does not reimplement lifecycle, availability, or pricing rules.
 */

import 'server-only';

import { addDays, format, parseISO } from 'date-fns';

import {
  BOOKING_DISPLAY_STATUS_LABELS,
  resolveBookingDisplayStatus,
  todayIsoDate as statusTodayIsoDate,
} from '@/features/bookings/service/status.service';
import {
  createBookingRepository,
  getBookingRepository,
  type BookingRepository,
} from '@/features/bookings/repository';
import {
  BOOKING_STATUS_CHART_COLORS,
  FLEET_AVAILABILITY_CHART_COLORS,
} from '@/features/dashboard/lib/chart-colors';
import type {
  BookingStatusChartData,
  DashboardData,
  DashboardFleetSnapshotItem,
  DashboardKpis,
  DashboardScheduleItem,
  FleetAvailabilityChartData,
} from '@/features/dashboard/types';
import {
  createVehicleRepository,
  getVehicleRepository,
  type VehicleRepository,
} from '@/features/vehicles/repository';
import {
  createAvailabilityService,
  getAvailabilityService,
  resolveAvailabilityFromBookings,
  type AvailabilityService,
} from '@/features/vehicles/service/availability.service';
import { PERMISSIONS, requirePermission } from '@/lib/auth';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { fromPromise } from '@/services';
import type { ApiResponse, BookingWithVehicle, Vehicle } from '@/types';
import { VEHICLE_AVAILABILITY_STATUS_LABELS, VEHICLE_AVAILABILITY_STATUSES } from '@/types/enums';

const RECENT_BOOKINGS_LIMIT = 10;
const FLEET_SNAPSHOT_LIMIT = 12;
const FLEET_HORIZON_DAYS = 90;

export interface DashboardServiceDeps {
  readonly bookingRepository?: BookingRepository;
  readonly vehicleRepository?: VehicleRepository;
  readonly availabilityService?: AvailabilityService;
  readonly client?: TypedSupabaseClient;
  readonly requirePermission?: typeof requirePermission;
  readonly todayIsoDate?: () => string;
}

export interface DashboardService {
  getDashboardData(): Promise<ApiResponse<DashboardData>>;
}

function addDaysIso(iso: string, days: number): string {
  return format(addDays(parseISO(iso), days), 'yyyy-MM-dd');
}

function buildBookingStatusChart(counts: {
  readonly upcoming: number;
  readonly active: number;
  readonly completed: number;
  readonly cancelled: number;
}): BookingStatusChartData {
  const slices = (
    [
      { status: 'upcoming' as const, count: counts.upcoming },
      { status: 'active' as const, count: counts.active },
      { status: 'completed' as const, count: counts.completed },
      { status: 'cancelled' as const, count: counts.cancelled },
    ] as const
  ).map((slice) => ({
    status: slice.status,
    label: BOOKING_DISPLAY_STATUS_LABELS[slice.status],
    count: slice.count,
    percentage: 0,
    colorVar: BOOKING_STATUS_CHART_COLORS[slice.status],
  }));

  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return {
    total,
    slices: slices.map((slice) => ({
      ...slice,
      percentage: total === 0 ? 0 : Math.round((slice.count / total) * 1000) / 10,
    })),
  };
}

function buildFleetAvailabilityChart(counts: {
  readonly available: number;
  readonly booked: number;
  readonly reserved: number;
  readonly maintenance: number;
  readonly inactive: number;
}): FleetAvailabilityChartData {
  const bars = (
    [
      VEHICLE_AVAILABILITY_STATUSES.available,
      VEHICLE_AVAILABILITY_STATUSES.booked,
      VEHICLE_AVAILABILITY_STATUSES.reserved,
      VEHICLE_AVAILABILITY_STATUSES.maintenance,
      VEHICLE_AVAILABILITY_STATUSES.inactive,
    ] as const
  ).map((status) => ({
    status,
    label: VEHICLE_AVAILABILITY_STATUS_LABELS[status],
    count: counts[status],
    colorVar: FLEET_AVAILABILITY_CHART_COLORS[status],
  }));

  return {
    total: bars.reduce((sum, bar) => sum + bar.count, 0),
    bars,
  };
}

function buildTodaysSchedule(
  bookings: readonly BookingWithVehicle[],
  asOfDate: string,
): DashboardScheduleItem[] {
  const items = bookings
    .filter((booking) => {
      const status = resolveBookingDisplayStatus(booking, asOfDate);
      if (status === 'cancelled' || status === 'draft') {
        return false;
      }
      return (
        booking.delivery_date === asOfDate ||
        booking.return_date === asOfDate ||
        (booking.delivery_date <= asOfDate && booking.return_date >= asOfDate)
      );
    })
    .map((booking) => ({
      bookingId: booking.id,
      invoiceNumber: booking.invoice_number,
      vehicleName: booking.vehicle.vehicle_name,
      vehicleNumber: booking.vehicle.vehicle_number,
      vehicleImagePath: booking.vehicle.image_path,
      customerName: booking.customer_name,
      deliveryDate: booking.delivery_date,
      returnDate: booking.return_date,
      displayStatus: resolveBookingDisplayStatus(booking, asOfDate),
    }));

  items.sort((a, b) => {
    const byPickup = a.deliveryDate.localeCompare(b.deliveryDate);
    if (byPickup !== 0) {
      return byPickup;
    }
    return a.invoiceNumber.localeCompare(b.invoiceNumber);
  });

  return items;
}

function buildFleetSnapshot(params: {
  readonly vehicles: readonly Vehicle[];
  readonly bookings: readonly BookingWithVehicle[];
  readonly asOfDate: string;
}): DashboardFleetSnapshotItem[] {
  const byVehicle = new Map<string, BookingWithVehicle[]>();

  for (const booking of params.bookings) {
    const list = byVehicle.get(booking.vehicle_id) ?? [];
    list.push(booking);
    byVehicle.set(booking.vehicle_id, list);
  }

  return params.vehicles.map((vehicle) => {
    const vehicleBookings = byVehicle.get(vehicle.id) ?? [];
    const availability = resolveAvailabilityFromBookings(vehicle, vehicleBookings, params.asOfDate);

    let currentBooking: DashboardFleetSnapshotItem['currentBooking'] = null;
    let futureBooking: DashboardFleetSnapshotItem['futureBooking'] = null;

    for (const booking of vehicleBookings) {
      const status = resolveBookingDisplayStatus(booking, params.asOfDate);
      if (status === 'cancelled' || status === 'draft' || status === 'completed') {
        continue;
      }

      if (status === 'active' && !currentBooking) {
        currentBooking = {
          bookingId: booking.id,
          invoiceNumber: booking.invoice_number,
          customerName: booking.customer_name,
        };
        continue;
      }

      if (status === 'upcoming' && !futureBooking) {
        futureBooking = {
          bookingId: booking.id,
          invoiceNumber: booking.invoice_number,
          customerName: booking.customer_name,
          deliveryDate: booking.delivery_date,
        };
      }
    }

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.vehicle_name,
      registrationNumber: vehicle.vehicle_number,
      imagePath: vehicle.image_path,
      availability,
      currentBooking,
      futureBooking,
    };
  });
}

export function createDashboardService(deps: DashboardServiceDeps = {}): DashboardService {
  const requirePerm = deps.requirePermission ?? requirePermission;
  const today = deps.todayIsoDate ?? statusTodayIsoDate;

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

  function getAvailability(): AvailabilityService {
    if (deps.availabilityService) {
      return deps.availabilityService;
    }
    if (deps.client) {
      return createAvailabilityService({
        client: deps.client,
        requirePermission: requirePerm,
        todayIsoDate: today,
      });
    }
    return getAvailabilityService();
  }

  return {
    getDashboardData() {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        await requirePerm(PERMISSIONS.vehiclesRead);

        const asOfDate = today();
        const bookingRepo = await getBookingsRepo();
        const vehicleRepo = await getVehiclesRepo();
        const availability = getAvailability();

        // Keep Availability Engine in the request path (self-heal before read).
        await availability.syncAllAvailabilityFromBookings();

        const horizonEnd = addDaysIso(asOfDate, FLEET_HORIZON_DAYS);

        const [
          activeBookings,
          upcomingBookings,
          completedBookings,
          cancelledBookings,
          availableVehicles,
          bookedVehicles,
          reservedVehicles,
          maintenanceVehicles,
          inactiveVehicles,
          totalVehicles,
          recentResult,
          todayOverlapping,
          fleetResult,
          horizonOverlapping,
        ] = await Promise.all([
          bookingRepo.count({ status: 'active' }),
          bookingRepo.count({ status: 'upcoming' }),
          bookingRepo.count({ status: 'completed' }),
          bookingRepo.count({ status: 'cancelled', includeCancelled: true }),
          vehicleRepo.count({ available: true }),
          vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.booked }),
          vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.reserved }),
          vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.maintenance }),
          vehicleRepo.count({ availabilityStatus: VEHICLE_AVAILABILITY_STATUSES.inactive }),
          vehicleRepo.count({ includeInactive: true }),
          bookingRepo.list({
            page: 1,
            pageSize: RECENT_BOOKINGS_LIMIT,
            sortBy: 'created_at',
            sortOrder: 'desc',
            includeCancelled: true,
          }),
          bookingRepo.findOverlappingInRange({
            deliveryDate: asOfDate,
            returnDate: asOfDate,
            includeCancelled: false,
            excludeDraft: true,
            limit: 200,
          }),
          vehicleRepo.list({
            page: 1,
            pageSize: FLEET_SNAPSHOT_LIMIT,
            includeInactive: false,
            sortBy: 'vehicle_name',
            sortOrder: 'asc',
          }),
          bookingRepo.findOverlappingInRange({
            deliveryDate: asOfDate,
            returnDate: horizonEnd,
            includeCancelled: false,
            excludeDraft: true,
            limit: 500,
          }),
        ]);

        const todaysPickups = todayOverlapping.filter((booking) => {
          const status = resolveBookingDisplayStatus(booking, asOfDate);
          return status !== 'cancelled' && status !== 'draft' && booking.delivery_date === asOfDate;
        }).length;

        const todaysReturns = todayOverlapping.filter((booking) => {
          const status = resolveBookingDisplayStatus(booking, asOfDate);
          return status !== 'cancelled' && status !== 'draft' && booking.return_date === asOfDate;
        }).length;

        const kpis: DashboardKpis = {
          activeBookings,
          upcomingBookings,
          availableVehicles,
          todaysPickups,
          todaysReturns,
          totalVehicles,
        };

        const bookingStatusChart = buildBookingStatusChart({
          upcoming: upcomingBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        });

        const fleetAvailabilityChart = buildFleetAvailabilityChart({
          available: availableVehicles,
          booked: bookedVehicles,
          reserved: reservedVehicles,
          maintenance: maintenanceVehicles,
          inactive: inactiveVehicles,
        });

        const todaysSchedule = buildTodaysSchedule(todayOverlapping, asOfDate);

        const fleetVehicles = fleetResult.data;
        const fleetVehicleIds = new Set(fleetVehicles.map((vehicle) => vehicle.id));
        const fleetBookings = horizonOverlapping.filter((booking) =>
          fleetVehicleIds.has(booking.vehicle_id),
        );

        const fleetSnapshot = buildFleetSnapshot({
          vehicles: fleetVehicles,
          bookings: fleetBookings,
          asOfDate,
        });

        const isEmpty = totalVehicles === 0 && bookingStatusChart.total === 0;

        return {
          asOfDate,
          kpis,
          bookingStatusChart,
          fleetAvailabilityChart,
          todaysSchedule,
          recentBookings: recentResult.data,
          fleetSnapshot,
          isEmpty,
        } satisfies DashboardData;
      });
    },
  };
}

let singleton: DashboardService | null = null;

export function getDashboardService(): DashboardService {
  if (!singleton) {
    singleton = createDashboardService();
  }
  return singleton;
}
