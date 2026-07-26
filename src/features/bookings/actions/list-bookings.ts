'use server';

/**
 * List / count booking Server Actions (filters, sort, pagination).
 */

import { getBookingService } from '@/features/bookings/service';
import type {
  ApiResponse,
  BookingListFilters,
  BookingListQuery,
  BookingWithVehicle,
  PaginatedResult,
} from '@/types';

export async function listBookings(
  query?: BookingListQuery,
): Promise<ApiResponse<PaginatedResult<BookingWithVehicle>>> {
  return getBookingService().listBookings(query);
}

export async function countBookings(filters?: BookingListFilters): Promise<ApiResponse<number>> {
  return getBookingService().countBookings(filters);
}
