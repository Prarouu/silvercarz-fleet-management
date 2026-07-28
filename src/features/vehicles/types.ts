/**
 * Vehicles feature type surface.
 *
 * Domain models live in `@/types` so bookings and other modules can share
 * one definition. Re-export here for feature-local imports.
 */

export type {
  FuelType,
  Vehicle,
  VehicleAvailabilityQuery,
  VehicleCreateInput,
  VehicleListFilters,
  VehicleListQuery,
  VehicleSortField,
  VehicleUpdateInput,
} from '@/types';

export {
  FUEL_TYPES,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  FUEL_TYPE_VALUES,
  VEHICLE_AVAILABILITY_STATUSES,
  VEHICLE_AVAILABILITY_STATUS_LABELS,
  VEHICLE_AVAILABILITY_STATUS_OPTIONS,
  VEHICLE_AVAILABILITY_STATUS_VALUES,
  isFuelType,
  isVehicleAvailabilityStatus,
  isVehicleBookableStatus,
} from '@/types';

export type { VehicleAvailabilityStatus } from '@/types';
