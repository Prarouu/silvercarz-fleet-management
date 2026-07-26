export type {
  BaseEntity,
  Nullable,
  PartialBy,
  SelectOption,
  SortOrder,
  TimestampFields,
} from './common';

export type {
  ListQueryParams,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
  SortParams,
} from './pagination';

export type { ApiFailure, ApiResponse, ApiSuccess } from './api';

export type { TableColumn, TableSortState } from './table';

export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate } from './database';

export type {
  BookingStatus,
  FuelType,
  PaymentMethod,
  RentalMode,
  UserRole,
  AppRole,
} from './enums';

export {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_OPTIONS,
  BOOKING_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  FUEL_TYPE_VALUES,
  isBookingStatus,
  isFuelType,
  isPaymentMethod,
  isRentalMode,
  isUserRole,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_VALUES,
  RENTAL_MODES,
  RENTAL_MODE_LABELS,
  RENTAL_MODE_OPTIONS,
  RENTAL_MODE_VALUES,
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_VALUES,
} from './enums';

export type {
  Booking,
  BookingCreateInput,
  BookingListFilters,
  BookingListQuery,
  BookingSortField,
  BookingUpdateInput,
  BookingVehicleOverlapQuery,
  BookingWithVehicle,
} from './booking';

export type {
  Vehicle,
  VehicleCreateInput,
  VehicleListFilters,
  VehicleUpdateInput,
} from './vehicle';

export type { AuthenticatedUser, AuthState, AuthUser, UserProfile } from './auth';

export { APP_ROLES, APP_ROLE_LABELS, APP_ROLE_VALUES, isAppRole } from './auth';
