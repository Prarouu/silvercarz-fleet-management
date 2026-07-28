'use server';

/**
 * Reconcile vehicle availability from booking lifecycle.
 * Fixes fleet rows left stale before the Availability Engine.
 */

import { getAvailabilityService } from '@/features/vehicles/service';
import type { ApiResponse } from '@/types';

export async function reconcileVehicleAvailability(): Promise<
  ApiResponse<{ readonly scanned: number; readonly updated: number }>
> {
  return getAvailabilityService().syncAllAvailabilityFromBookings();
}
