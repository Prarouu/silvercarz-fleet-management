'use server';

/**
 * Search bookings Server Action.
 *
 * Matches invoice number, customer name, contact number, place to visit,
 * and vehicle registration (via related vehicles lookup).
 */

import { getBookingService } from '@/features/bookings/service';
import type { ApiResponse, BookingListQuery, BookingWithVehicle, PaginatedResult } from '@/types';

export async function searchBookings(
  search: string,
  query?: BookingListQuery,
): Promise<ApiResponse<PaginatedResult<BookingWithVehicle>>> {
  return getBookingService().searchBookings(search, query);
}
