'use server';

/**
 * Lists booked calendar dates for a vehicle (customer availability grid).
 * Returns ISO dates only — never invoice / customer / status details.
 */

import { getCustomerBookingService } from '@/features/customer-booking/service/customer-booking-service';
import type { ApiResponse } from '@/types';

export async function listCustomerVehicleBookedDates(
  input: unknown,
): Promise<ApiResponse<{ readonly bookedDates: string[] }>> {
  return getCustomerBookingService().listBookedDates(input);
}
