/**
 * Admin Dashboard view models.
 * Built by the Dashboard Service from Booking / Vehicle repositories and engines.
 */

import type { BookingDisplayStatus } from '@/features/bookings/service/status.service';
import type { BookingWithVehicle, VehicleAvailabilityStatus } from '@/types';

export type DashboardKpis = {
  readonly activeBookings: number;
  readonly upcomingBookings: number;
  readonly availableVehicles: number;
  readonly todaysPickups: number;
  readonly todaysReturns: number;
  readonly totalVehicles: number;
};

export type BookingStatusChartSlice = {
  readonly status: Extract<BookingDisplayStatus, 'upcoming' | 'active' | 'completed' | 'cancelled'>;
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
  /** Theme CSS variable — e.g. `var(--chart-1)`. */
  readonly colorVar: string;
};

export type BookingStatusChartData = {
  readonly total: number;
  readonly slices: readonly BookingStatusChartSlice[];
};

export type FleetAvailabilityChartBar = {
  readonly status: VehicleAvailabilityStatus;
  readonly label: string;
  readonly count: number;
  readonly colorVar: string;
};

export type FleetAvailabilityChartData = {
  readonly total: number;
  readonly bars: readonly FleetAvailabilityChartBar[];
};

export type DashboardScheduleItem = {
  readonly bookingId: string;
  readonly invoiceNumber: string;
  readonly vehicleName: string;
  readonly vehicleNumber: string;
  readonly vehicleImagePath: string | null;
  readonly customerName: string;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly displayStatus: BookingDisplayStatus;
};

export type DashboardFleetSnapshotItem = {
  readonly vehicleId: string;
  readonly vehicleName: string;
  readonly registrationNumber: string;
  readonly imagePath: string | null;
  readonly availability: VehicleAvailabilityStatus;
  readonly currentBooking: {
    readonly bookingId: string;
    readonly invoiceNumber: string;
    readonly customerName: string;
  } | null;
  readonly futureBooking: {
    readonly bookingId: string;
    readonly invoiceNumber: string;
    readonly customerName: string;
    readonly deliveryDate: string;
  } | null;
};

export type DashboardData = {
  readonly asOfDate: string;
  readonly kpis: DashboardKpis;
  readonly bookingStatusChart: BookingStatusChartData;
  readonly fleetAvailabilityChart: FleetAvailabilityChartData;
  readonly todaysSchedule: readonly DashboardScheduleItem[];
  readonly recentBookings: readonly BookingWithVehicle[];
  readonly fleetSnapshot: readonly DashboardFleetSnapshotItem[];
  /** True when the fleet and booking tables are both empty. */
  readonly isEmpty: boolean;
};
