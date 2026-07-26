'use server';

/**
 * List / count vehicle Server Actions (filters, sort, pagination).
 */

import { getVehicleService } from '@/features/vehicles/service';
import type {
  ApiResponse,
  PaginatedResult,
  Vehicle,
  VehicleListFilters,
  VehicleListQuery,
} from '@/types';

export async function listVehicles(
  query?: VehicleListQuery,
): Promise<ApiResponse<PaginatedResult<Vehicle>>> {
  return getVehicleService().listVehicles(query);
}

export async function countVehicles(filters?: VehicleListFilters): Promise<ApiResponse<number>> {
  return getVehicleService().countVehicles(filters);
}
