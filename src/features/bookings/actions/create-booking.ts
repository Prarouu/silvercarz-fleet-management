'use server';

/**
 * Create booking Server Action.
 * Validates via the service layer — never talks to Supabase directly.
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking } from '@/types';

export async function createBooking(input: unknown): Promise<ApiResponse<Booking>> {
  return getBookingService().createBooking(input);
}
