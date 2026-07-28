/**
 * Vehicles feature public exports.
 *
 * Data layer (repository, service, Server Actions), Fleet List UI,
 * Add / Edit Vehicle workflows, and Vehicle Details (fleet profile).
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
  VEHICLE_AVAILABILITY_STATUSES,
  VEHICLE_AVAILABILITY_STATUS_LABELS,
  VEHICLE_AVAILABILITY_STATUS_OPTIONS,
  VEHICLE_AVAILABILITY_STATUS_VALUES,
  isFuelType,
  isVehicleAvailabilityStatus,
  isVehicleBookableStatus,
} from './types';

export type { VehicleAvailabilityStatus } from './types';

export {
  VEHICLE_ERROR_CODES,
  createDuplicateVehicleNumberError,
  createInactiveVehicleError,
  createInvalidAvailabilityStatusError,
  createUnauthorizedVehicleAccessError,
  createVehicleDatabaseFailureError,
  createVehicleNotFoundError,
  createVehicleStorageFailureError,
  createVehicleUnavailableForBookingError,
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
  createAvailabilityService,
  getAvailabilityService,
  resolveAvailabilityFromBookings,
  type VehicleService,
  type VehicleServiceDeps,
  type AvailabilityService,
  type AvailabilityServiceDeps,
} from './service';

export {
  countVehicles,
  createVehicle,
  deleteVehicle,
  getVehicle,
  getVehicleByNumber,
  listVehicles,
  reconcileVehicleAvailability,
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
  VehicleDetailActions,
  VehicleDetailField,
  VehicleDetailImage,
  VehicleDetailOverview,
  VehicleDetailPage,
  VehicleDetailQuickActions,
  VehicleDetailSection,
  VehicleDetailSkeleton,
  VehicleDetailStats,
  VehicleForm,
  VehicleImageField,
  VehicleImageSection,
  VehicleList,
  VehicleListSkeleton,
  VehicleOperationalSection,
  VehicleRecentBookings,
  VehicleRecentBookingsTable,
  VehicleRentalSection,
  VehicleStatusBadge,
  resolveVehicleAvailability,
  type VehicleAvailability,
  type VehicleDetailStatsData,
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
