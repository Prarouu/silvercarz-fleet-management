'use server';

/**
 * List / count booking Server Actions (filters, sort, pagination).
 */

import { getBookingService } from '@/features/bookings/service';
import type {
  ApiResponse,
  Booking,
  BookingListFilters,
  BookingListQuery,
  PaginatedResult,
} from '@/types';

export async function listBookings(
  query?: BookingListQuery,
): Promise<ApiResponse<PaginatedResult<Booking>>> {
  return getBookingService().listBookings(query);
}

export async function countBookings(filters?: BookingListFilters): Promise<ApiResponse<number>> {
  return getBookingService().countBookings(filters);
}
