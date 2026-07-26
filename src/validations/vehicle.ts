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
  odometerSchema,
  optionalNullableStringSchema,
  requiredString,
  vehicleAvailabilityStatusSchema,
  vehicleNumberSchema,
} from '@/validations/shared';

const currentYear = new Date().getFullYear();

const optionalNullableMoneySchema = z.union([
  moneySchema,
  z.null(),
  z.undefined().transform(() => null),
]);

const optionalNullableModelYearSchema = z.union([
  z
    .number({ error: 'Enter a valid model year.' })
    .int('Enter a valid model year.')
    .min(1980, 'Model year must be 1980 or later.')
    .max(currentYear + 1, `Model year must be ${currentYear + 1} or earlier.`),
  z.null(),
  z.undefined().transform(() => null),
]);

/**
 * Shared vehicle field shapes without create-only defaults.
 *
 * Defaults must NOT live on this object — `updateVehicleSchema` is `.partial()` of
 * these fields, and Zod `.default()` would re-inject values (e.g. `is_active: true`)
 * on partial updates like `{ image_path }`, wiping the saved status.
 */
const vehicleFieldsSchema = z.object({
  vehicle_name: requiredString('Vehicle name is required.').max(
    120,
    'Vehicle name must be at most 120 characters.',
  ),
  vehicle_number: vehicleNumberSchema,
  brand: requiredString('Brand is required.').max(80, 'Brand must be at most 80 characters.'),
  model: requiredString('Model is required.').max(80, 'Model must be at most 80 characters.'),
  variant: optionalNullableStringSchema,
  model_year: optionalNullableModelYearSchema,
  color: optionalNullableStringSchema,
  fuel_type: fuelTypeSchema,
  default_daily_rate: moneySchema,
  extra_kilometer_rate: optionalNullableMoneySchema,
  security_deposit: optionalNullableMoneySchema,
  current_odometer: odometerSchema,
  availability_status: vehicleAvailabilityStatusSchema,
  image_path: optionalNullableStringSchema,
  is_active: z.boolean(),
});

/**
 * Create requires explicit status fields from the form/API.
 * Defaults live in the Add Vehicle form only — not on update/partial schemas.
 */
export const createVehicleSchema = vehicleFieldsSchema;

/** Update: only patch provided keys — never re-default omitted status fields. */
export const updateVehicleSchema = vehicleFieldsSchema.partial();

/** Form-friendly vehicle filters (camelCase query params). */
export const vehicleListFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  fuelType: fuelTypeSchema.optional(),
  isActive: z.boolean().optional(),
  includeInactive: z.boolean().optional(),
  available: z.boolean().optional(),
  availabilityStatus: vehicleAvailabilityStatusSchema.optional(),
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
