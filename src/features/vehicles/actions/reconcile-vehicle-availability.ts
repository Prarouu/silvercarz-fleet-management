'use server';

/**
 * Manual / ops reconcile of vehicle availability from booking lifecycle.
 *
 * Not used on normal page reads — write paths sync a single vehicle after
 * booking create/update/delete. Prefer this only for one-off repairs.
 */

import { getAvailabilityService } from '@/features/vehicles/service';
import type { ApiResponse } from '@/types';

export async function reconcileVehicleAvailability(): Promise<
  ApiResponse<{ readonly scanned: number; readonly updated: number }>
> {
  return getAvailabilityService().syncAllAvailabilityFromBookings();
}
