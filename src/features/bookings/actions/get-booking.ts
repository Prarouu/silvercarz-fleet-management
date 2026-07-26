'use server';

/**
 * Read booking Server Actions.
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking, BookingWithVehicle } from '@/types';

export async function getBooking(id: string): Promise<ApiResponse<Booking>> {
  return getBookingService().getBooking(id);
}

export async function getBookingByInvoiceNumber(
  invoiceNumber: string,
): Promise<ApiResponse<Booking>> {
  return getBookingService().getBookingByInvoiceNumber(invoiceNumber);
}

export async function getBookingWithVehicle(id: string): Promise<ApiResponse<BookingWithVehicle>> {
  return getBookingService().getBookingWithVehicle(id);
}
