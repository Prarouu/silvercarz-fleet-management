/**
 * Vehicle domain models.
 *
 * Row / insert / update shapes are aliases of generated Supabase types —
 * do not redefine column interfaces here.
 */

import type { FuelType } from '@/types/enums';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

/** Persisted vehicle row (`public.vehicles`). */
export type Vehicle = Tables<'vehicles'>;

/** Payload for inserting a vehicle (Supabase insert shape). */
export type VehicleCreateInput = TablesInsert<'vehicles'>;

/** Payload for updating a vehicle (Supabase update shape). */
export type VehicleUpdateInput = TablesUpdate<'vehicles'>;

/** Common list / filter inputs for vehicle queries. */
export interface VehicleListFilters {
  readonly search?: string;
  readonly fuelType?: FuelType;
  readonly isActive?: boolean;
}
