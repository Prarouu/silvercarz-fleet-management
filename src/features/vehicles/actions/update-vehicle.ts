'use server';

/**
 * Update vehicle Server Action.
 */

import { getVehicleService } from '@/features/vehicles/service';
import type { ApiResponse, Vehicle } from '@/types';

export async function updateVehicle(id: string, input: unknown): Promise<ApiResponse<Vehicle>> {
  return getVehicleService().updateVehicle(id, input);
}
