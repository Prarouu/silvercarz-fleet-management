'use server';

/**
 * Soft-delete booking Server Action (status → cancelled).
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, Booking } from '@/types';

export async function deleteBooking(id: string): Promise<ApiResponse<Booking>> {
  return getBookingService().deleteBooking(id);
}
