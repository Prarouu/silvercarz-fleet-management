'use server';

/**
 * Deny a draft customer booking request (draft → denied).
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking } from '@/types';

export async function rejectBooking(id: string, reason: string): Promise<ApiResponse<Booking>> {
  return getBookingService().rejectBooking(id, reason);
}
