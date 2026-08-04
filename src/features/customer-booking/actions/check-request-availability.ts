'use server';

/**
 * Pre-submit availability check for the customer date step.
 * Authoritative conflict check still runs again on submit.
 */

import { getCustomerBookingService } from '@/features/customer-booking/service/customer-booking-service';
import type { ApiResponse } from '@/types';

export async function checkCustomerBookingAvailability(
  input: unknown,
): Promise<ApiResponse<{ available: true }>> {
  return getCustomerBookingService().checkRequestAvailability(input);
}
