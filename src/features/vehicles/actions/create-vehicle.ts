'use server';

/**
 * Create vehicle Server Action.
 * Validates via the service layer — never talks to Supabase directly.
 */

import { getVehicleService } from '@/features/vehicles/service';
import type { ApiResponse, Vehicle } from '@/types';

export async function createVehicle(input: unknown): Promise<ApiResponse<Vehicle>> {
  return getVehicleService().createVehicle(input);
}
