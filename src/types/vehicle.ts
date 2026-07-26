/**
 * Vehicle domain models.
 *
 * Row / insert / update shapes are aliases of generated Supabase types —
 * do not redefine column interfaces here.
 */

import type { PaginationParams, SortParams } from '@/types/pagination';
import type { FuelType } from '@/types/enums';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

/** Persisted vehicle row (`public.vehicles`). */
export type Vehicle = Tables<'vehicles'>;

/** Payload for inserting a vehicle (Supabase insert shape). */
export type VehicleCreateInput = TablesInsert<'vehicles'>;

/** Payload for updating a vehicle (Supabase update shape). */
export type VehicleUpdateInput = TablesUpdate<'vehicles'>;

/** Allowed sort columns for vehicle list queries. */
export type VehicleSortField =
  'vehicle_name' | 'vehicle_number' | 'fuel_type' | 'created_at' | 'updated_at';

/** Common list / filter inputs for vehicle queries. */
export interface VehicleListFilters {
  readonly search?: string;
  readonly fuelType?: FuelType;
  readonly isActive?: boolean;
  /**
   * When false (default), soft-retired (`is_active = false`) rows are excluded.
   * Ignored when `isActive` is set explicitly.
   */
  readonly includeInactive?: boolean;
  /**
   * Architecture-ready availability flag.
   * Today: equivalent to requiring `is_active = true`.
   * Future: also exclude vehicles with booking conflicts in a date window.
   */
  readonly available?: boolean;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  /**
   * Cursor-ready token for keyset pagination (unused by offset pagination today).
   * Reserved so list APIs can adopt cursors without breaking callers.
   */
  readonly cursor?: string;
}

/** Full list query: filters + pagination + sorting. */
export interface VehicleListQuery
  extends VehicleListFilters, Partial<PaginationParams>, SortParams<VehicleSortField> {}

/**
 * Future availability check input (date-range ready).
 * Booking conflict detection is not implemented yet.
 */
export interface VehicleAvailabilityQuery {
  readonly vehicleId: string;
  readonly deliveryDate?: string;
  readonly returnDate?: string;
  readonly excludeBookingId?: string;
}
