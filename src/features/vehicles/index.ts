/**
 * Vehicles feature public exports.
 *
 * Data layer only in this phase — repository, service, Server Actions.
 * No UI / pages yet.
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
} from './types';

export {
  FUEL_TYPES,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  FUEL_TYPE_VALUES,
  isFuelType,
} from './types';

export {
  VEHICLE_ERROR_CODES,
  createDuplicateVehicleNumberError,
  createInactiveVehicleError,
  createUnauthorizedVehicleAccessError,
  createVehicleDatabaseFailureError,
  createVehicleNotFoundError,
  createVehicleValidationError,
  type VehicleErrorCode,
} from './errors';

export {
  createVehicleRepository,
  getVehicleRepository,
  type VehicleRepository,
} from './repository';

export {
  createVehicleService,
  getVehicleService,
  type VehicleService,
  type VehicleServiceDeps,
} from './service';

export {
  countVehicles,
  createVehicle,
  deleteVehicle,
  getVehicle,
  getVehicleByNumber,
  listVehicles,
  searchVehicles,
  updateVehicle,
} from './actions';

export {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleListFiltersSchema,
  vehicleListQuerySchema,
  vehicleSortFieldSchema,
  type CreateVehicleValues,
  type UpdateVehicleValues,
  type VehicleListFilterValues,
  type VehicleListQueryValues,
} from '@/validations';
