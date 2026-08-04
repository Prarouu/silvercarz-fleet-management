'use server';

/**
 * Load the authenticated customer's own booking request.
 */

import { getCustomerBookingService } from '@/features/customer-booking/service/customer-booking-service';
import type { ApiResponse, Booking, BookingWithVehicle } from '@/types';

export async function getOwnCustomerBooking(bookingId: string): Promise<ApiResponse<Booking>> {
  return getCustomerBookingService().getOwnBooking(bookingId);
}

export async function getOwnCustomerBookingWithVehicle(
  bookingId: string,
): Promise<ApiResponse<BookingWithVehicle>> {
  return getCustomerBookingService().getOwnBookingWithVehicle(bookingId);
}
