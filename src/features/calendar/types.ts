/**
 * Fleet Availability Calendar — view models and query contracts.
 *
 * Scheduling foundation for admin calendar, future portal, reports,
 * and dashboard. Business rules stay in Status / Availability / Conflict engines.
 */

import type { BookingDisplayStatus, BookingStatusBadgeVariant } from '@/features/bookings/service';
import type { BookingWithVehicle, FuelType, Vehicle, VehicleAvailabilityStatus } from '@/types';

/** Supported calendar presentation modes (Year reserved for a later phase). */
export const CALENDAR_VIEWS = {
  day: 'day',
  week: 'week',
  month: 'month',
  /** Reserved — not implemented in the UI yet. */
  year: 'year',
} as const;

export type CalendarView = (typeof CALENDAR_VIEWS)[keyof typeof CALENDAR_VIEWS];

export type CalendarViewImplemented = Exclude<CalendarView, 'year'>;

export const CALENDAR_VIEW_OPTIONS: ReadonlyArray<{
  readonly value: CalendarViewImplemented;
  readonly label: string;
}> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/** Summary tiles for the calendar header strip. */
export type CalendarSummary = {
  readonly availableVehicles: number;
  readonly bookedVehicles: number;
  readonly todaysPickups: number;
  readonly todaysReturns: number;
  readonly activeBookings: number;
  readonly upcomingBookings: number;
};

/** Calendar event — presentation only; links to booking detail. */
export type CalendarEvent = {
  readonly id: string;
  readonly bookingId: string;
  readonly invoiceNumber: string;
  readonly vehicleId: string;
  readonly vehicleName: string;
  readonly registrationNumber: string;
  readonly vehicleImagePath: string | null;
  readonly customerName: string;
  readonly driverName: string | null;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly displayStatus: BookingDisplayStatus;
  readonly statusLabel: string;
  readonly badgeVariant: BookingStatusBadgeVariant;
  readonly remainingBalance: number;
};

/** One occupancy block on the fleet timeline. */
export type FleetOccupancyBlock = {
  readonly bookingId: string;
  readonly invoiceNumber: string;
  readonly customerName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly displayStatus: BookingDisplayStatus;
  readonly statusLabel: string;
  readonly badgeVariant: BookingStatusBadgeVariant;
};

/** Vehicle row for the fleet timeline. */
export type FleetTimelineRow = {
  readonly vehicleId: string;
  readonly vehicleName: string;
  readonly registrationNumber: string;
  readonly vehicleImagePath: string | null;
  readonly availabilityStatus: VehicleAvailabilityStatus;
  readonly blocks: readonly FleetOccupancyBlock[];
};

/** Pickup / return agenda row. */
export type CalendarAgendaItem = {
  readonly bookingId: string;
  readonly invoiceNumber: string;
  readonly customerName: string;
  readonly vehicleName: string;
  readonly registrationNumber: string;
  readonly vehicleImagePath: string | null;
  readonly date: string;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly displayStatus: BookingDisplayStatus;
  readonly statusLabel: string;
  readonly badgeVariant: BookingStatusBadgeVariant;
  readonly remainingBalance: number | null;
};

export type CalendarVehicleOption = {
  readonly id: string;
  readonly label: string;
};

/** Full payload returned by the calendar service for one viewport. */
export type CalendarPageData = {
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly asOfDate: string;
  readonly summary: CalendarSummary;
  readonly events: readonly CalendarEvent[];
  readonly timeline: readonly FleetTimelineRow[];
  readonly upcomingPickups: readonly CalendarAgendaItem[];
  readonly upcomingReturns: readonly CalendarAgendaItem[];
  readonly vehicles: readonly CalendarVehicleOption[];
  readonly fleet: readonly Vehicle[];
};

/** Service query derived from URL state. */
export type CalendarQuery = {
  readonly view: CalendarViewImplemented;
  readonly date: string;
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly search?: string;
  readonly vehicleId?: string;
  readonly availability?: VehicleAvailabilityStatus;
  readonly status?: BookingDisplayStatus;
  readonly driver?: string;
  readonly fuelType?: FuelType;
  readonly from?: string;
  readonly to?: string;
};

export type { BookingWithVehicle };
