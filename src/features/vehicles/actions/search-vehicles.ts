'use server';

/**
 * Search vehicles Server Action.
 *
 * Matches vehicle name, registration number, fuel type, and active status.
 */

import { getVehicleService } from '@/features/vehicles/service';
import type { ApiResponse, PaginatedResult, Vehicle, VehicleListQuery } from '@/types';

export async function searchVehicles(
  search: string,
  query?: VehicleListQuery,
): Promise<ApiResponse<PaginatedResult<Vehicle>>> {
  return getVehicleService().searchVehicles(search, query);
}
