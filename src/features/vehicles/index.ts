/**
 * Vehicles feature public exports.
 *
 * Data layer (repository, service, Server Actions), Fleet List UI,
 * Add Vehicle, and Edit Vehicle workflows. Details page is deferred.
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
  createVehicleStorageFailureError,
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
  removeVehicleImageAction,
  searchVehicles,
  updateVehicle,
  uploadVehicleImageAction,
  type RemoveVehicleImageResult,
  type UploadVehicleImageResult,
} from './actions';

export {
  CreateVehicleForm,
  CreateVehiclePage,
  CreateVehicleSkeleton,
  EditVehiclePage,
  VehicleAvailabilityBadge,
  VehicleBasicSection,
  VehicleBreadcrumb,
  VehicleForm,
  VehicleImageField,
  VehicleImageSection,
  VehicleList,
  VehicleListSkeleton,
  VehicleOperationalSection,
  VehicleRentalSection,
  VehicleStatusBadge,
  resolveVehicleAvailability,
  type VehicleAvailability,
  type VehicleFleetSummary,
  type VehicleFormProps,
} from './components';

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
