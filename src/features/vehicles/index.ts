/**
 * Vehicles feature public exports.
 *
 * Types and validation only in this phase — no UI or CRUD yet.
 */

export type {
  FuelType,
  Vehicle,
  VehicleCreateInput,
  VehicleListFilters,
  VehicleUpdateInput,
} from './types';

export {
  FUEL_TYPES,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  FUEL_TYPE_VALUES,
  isFuelType,
} from './types';

export {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleListFiltersSchema,
  type CreateVehicleValues,
  type UpdateVehicleValues,
  type VehicleListFilterValues,
} from '@/validations';
