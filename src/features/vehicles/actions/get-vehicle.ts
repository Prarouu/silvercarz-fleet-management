'use server';

/**
 * Read vehicle Server Actions.
 */

import { getVehicleService } from '@/features/vehicles/service';
import type { ApiResponse, Vehicle } from '@/types';

export async function getVehicle(id: string): Promise<ApiResponse<Vehicle>> {
  return getVehicleService().getVehicle(id);
}

export async function getVehicleByNumber(vehicleNumber: string): Promise<ApiResponse<Vehicle>> {
  return getVehicleService().getVehicleByNumber(vehicleNumber);
}
