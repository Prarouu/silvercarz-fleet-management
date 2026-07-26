/**
 * Vehicle create / update Zod schemas.
 *
 * Output shapes align with Supabase `vehicles` insert/update columns (snake_case).
 */

import { z } from 'zod';

import {
  fuelTypeSchema,
  isoDateSchema,
  moneySchema,
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
  search: z.string().trim().max(200).optional(),
  fuelType: fuelTypeSchema.optional(),
  isActive: z.boolean().optional(),
  includeInactive: z.boolean().optional(),
  available: z.boolean().optional(),
  createdFrom: isoDateSchema.optional(),
  createdTo: isoDateSchema.optional(),
  cursor: z.string().trim().min(1).optional(),
});

export const vehicleSortFieldSchema = z.enum([
  'vehicle_name',
  'vehicle_number',
  'fuel_type',
  'created_at',
  'updated_at',
]);

/** Full list query: filters + pagination + sorting. */
export const vehicleListQuerySchema = vehicleListFiltersSchema.extend({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  sortBy: vehicleSortFieldSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateVehicleValues = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleValues = z.infer<typeof updateVehicleSchema>;
export type VehicleListFilterValues = z.infer<typeof vehicleListFiltersSchema>;
export type VehicleListQueryValues = z.infer<typeof vehicleListQuerySchema>;
