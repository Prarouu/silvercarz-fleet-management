/**
 * Vehicle create / update Zod schemas.
 *
 * Output shapes align with Supabase `vehicles` insert/update columns (snake_case).
 */

import { z } from 'zod';

import {
  fuelTypeSchema,
  moneySchema,
  optionalNullableStringSchema,
  requiredString,
  vehicleNumberSchema,
} from '@/validations/shared';

const vehicleFieldsSchema = z.object({
  vehicle_name: requiredString('Vehicle name is required.').max(
    120,
    'Vehicle name must be at most 120 characters.',
  ),
  vehicle_number: vehicleNumberSchema,
  fuel_type: fuelTypeSchema,
  default_daily_rate: moneySchema,
  is_active: z.boolean().default(true),
});

export const createVehicleSchema = vehicleFieldsSchema;

export const updateVehicleSchema = vehicleFieldsSchema.partial();

/** Form-friendly vehicle filters (camelCase query params). */
export const vehicleListFiltersSchema = z.object({
  search: optionalNullableStringSchema.optional(),
  fuelType: fuelTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

export type CreateVehicleValues = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleValues = z.infer<typeof updateVehicleSchema>;
export type VehicleListFilterValues = z.infer<typeof vehicleListFiltersSchema>;
