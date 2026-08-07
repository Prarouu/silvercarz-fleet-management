'use server';

/**
 * List the authenticated customer's own booking requests.
 */

import { getCustomerBookingService } from '@/features/customer-booking/service/customer-booking-service';
import type { ApiResponse, BookingWithVehicle } from '@/types';

export async function listOwnCustomerBookings(): Promise<
  ApiResponse<readonly BookingWithVehicle[]>
> {
  return getCustomerBookingService().listOwnBookings();
}
