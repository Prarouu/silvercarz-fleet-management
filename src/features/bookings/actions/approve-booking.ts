'use server';

/**
 * Approve a draft customer booking request (draft → confirmed/ongoing/completed).
 * Approved bookings are payment-eligible (C6); invoice number is unchanged.
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking } from '@/types';

export async function approveBooking(id: string): Promise<ApiResponse<Booking>> {
  return getBookingService().approveBooking(id);
}
