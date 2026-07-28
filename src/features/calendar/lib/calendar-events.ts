/**
 * Map bookings → calendar presentation models.
 * Status colors / labels come exclusively from the Status Automation Engine.
 * Outstanding balance comes from the Pricing Engine.
 *
 * Client-safe — do not import server-only modules here.
 */

import {
  getBookingStatusPresentation,
  resolveBookingDisplayStatus,
  type BookingDisplayStatus,
  type BookingStatusBadgeVariant,
} from '@/features/bookings/service/status.service';
import { pricingFromBooking } from '@/features/bookings/service/pricing.service';
import type { CalendarAgendaItem, CalendarEvent } from '@/features/calendar/types';
import type { BookingWithVehicle } from '@/types';

export function toCalendarEvent(booking: BookingWithVehicle, asOfDate: string): CalendarEvent {
  const presentation = getBookingStatusPresentation(booking, asOfDate);
  const pricing = pricingFromBooking(booking);

  return {
    id: booking.id,
    bookingId: booking.id,
    invoiceNumber: booking.invoice_number,
    vehicleId: booking.vehicle_id,
    vehicleName: booking.vehicle.vehicle_name,
    registrationNumber: booking.vehicle.vehicle_number,
    vehicleImagePath: booking.vehicle.image_path,
    customerName: booking.customer_name,
    driverName: booking.driver_name,
    deliveryDate: booking.delivery_date,
    returnDate: booking.return_date,
    displayStatus: presentation.status,
    statusLabel: presentation.label,
    badgeVariant: presentation.badgeVariant,
    remainingBalance: pricing.remainingBalance,
  };
}

export function filterEventsByDisplayStatus(
  events: readonly CalendarEvent[],
  status: BookingDisplayStatus | undefined,
): CalendarEvent[] {
  if (!status) {
    return [...events];
  }
  return events.filter((event) => event.displayStatus === status);
}

export function buildUpcomingPickups(
  bookings: readonly BookingWithVehicle[],
  asOfDate: string,
  limit = 12,
): CalendarAgendaItem[] {
  return bookings
    .filter((booking) => {
      const status = resolveBookingDisplayStatus(booking, asOfDate);
      return status !== 'cancelled' && status !== 'draft' && booking.delivery_date >= asOfDate;
    })
    .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))
    .slice(0, limit)
    .map((booking) => {
      const presentation = getBookingStatusPresentation(booking, asOfDate);
      return {
        bookingId: booking.id,
        invoiceNumber: booking.invoice_number,
        customerName: booking.customer_name,
        vehicleName: booking.vehicle.vehicle_name,
        registrationNumber: booking.vehicle.vehicle_number,
        vehicleImagePath: booking.vehicle.image_path,
        date: booking.delivery_date,
        deliveryDate: booking.delivery_date,
        returnDate: booking.return_date,
        displayStatus: presentation.status,
        statusLabel: presentation.label,
        badgeVariant: presentation.badgeVariant,
        remainingBalance: null,
      };
    });
}

export function buildUpcomingReturns(
  bookings: readonly BookingWithVehicle[],
  asOfDate: string,
  limit = 12,
): CalendarAgendaItem[] {
  return bookings
    .filter((booking) => {
      const status = resolveBookingDisplayStatus(booking, asOfDate);
      return status !== 'cancelled' && status !== 'draft' && booking.return_date >= asOfDate;
    })
    .sort((a, b) => a.return_date.localeCompare(b.return_date))
    .slice(0, limit)
    .map((booking) => {
      const presentation = getBookingStatusPresentation(booking, asOfDate);
      const pricing = pricingFromBooking(booking);
      return {
        bookingId: booking.id,
        invoiceNumber: booking.invoice_number,
        customerName: booking.customer_name,
        vehicleName: booking.vehicle.vehicle_name,
        registrationNumber: booking.vehicle.vehicle_number,
        vehicleImagePath: booking.vehicle.image_path,
        date: booking.return_date,
        deliveryDate: booking.delivery_date,
        returnDate: booking.return_date,
        displayStatus: presentation.status,
        statusLabel: presentation.label,
        badgeVariant: presentation.badgeVariant,
        remainingBalance: pricing.remainingBalance,
      };
    });
}

/**
 * Map Status Engine badge variants → calendar event surface classes.
 * Never map status → color directly; always go through badgeVariant.
 */
export const CALENDAR_EVENT_VARIANT_CLASSES: Record<BookingStatusBadgeVariant, string> = {
  default: 'border-primary/30 bg-primary/15 text-primary',
  secondary: 'border-border bg-secondary text-secondary-foreground',
  destructive: 'border-destructive/30 bg-destructive/15 text-destructive',
  success: 'border-success/30 bg-success/15 text-success',
  warning: 'border-warning/30 bg-warning/15 text-warning',
  info: 'border-info/30 bg-info/15 text-info',
  outline: 'border-border bg-card text-foreground',
  ghost: 'border-transparent bg-muted/60 text-muted-foreground',
  link: 'border-primary/20 bg-transparent text-primary',
};
