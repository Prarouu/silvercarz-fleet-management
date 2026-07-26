'use server';

/**
 * Update booking Server Action.
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking } from '@/types';

export async function updateBooking(id: string, input: unknown): Promise<ApiResponse<Booking>> {
  return getBookingService().updateBooking(id, input);
}
