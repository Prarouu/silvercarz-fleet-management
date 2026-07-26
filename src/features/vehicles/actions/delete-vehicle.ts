'use server';

/**
 * Soft-delete vehicle Server Action (`is_active → false`).
 */

import { getVehicleService } from '@/features/vehicles/service';
import type { ApiResponse, Vehicle } from '@/types';

export async function deleteVehicle(id: string): Promise<ApiResponse<Vehicle>> {
  return getVehicleService().deleteVehicle(id);
}
