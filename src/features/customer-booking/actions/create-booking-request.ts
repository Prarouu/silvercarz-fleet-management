'use server';

/**
 * Customer booking REQUEST Server Action.
 * Creates a draft booking for admin approval — never confirms payment/status.
 */

import { getCustomerBookingService } from '@/features/customer-booking/service/customer-booking-service';
import type { ApiResponse, Booking } from '@/types';

export async function createCustomerBookingRequest(input: unknown): Promise<ApiResponse<Booking>> {
  return getCustomerBookingService().createBookingRequest(input);
}
