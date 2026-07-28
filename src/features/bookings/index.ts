/**
 * Bookings feature public exports.
 *
 * Data layer, booking list UI, create/edit form, and booking details workspace.
 */

export type {
  Booking,
  BookingConflict,
  BookingConflictCheckParams,
  BookingConflictResult,
  BookingCreateInput,
  BookingListFilters,
  BookingListQuery,
  BookingSortField,
  BookingStatus,
  BookingUpdateInput,
  BookingVehicleOverlapQuery,
  BookingWithVehicle,
  PaymentMethod,
  RentalMode,
} from './types';

export {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_OPTIONS,
  BOOKING_STATUS_VALUES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_VALUES,
  RENTAL_MODES,
  RENTAL_MODE_LABELS,
  RENTAL_MODE_OPTIONS,
  RENTAL_MODE_VALUES,
  isBookingStatus,
  isPaymentMethod,
  isRentalMode,
} from './types';

export {
  BOOKING_ERROR_CODES,
  createBookingConflictError,
  createBookingDatabaseFailureError,
  createBookingNotFoundError,
  createBookingValidationError,
  createDuplicateInvoiceError,
  createInvoiceGenerationError,
  createInvalidBookingDatesError,
  createUnauthorizedBookingAccessError,
  createVehicleUnavailableError,
  type BookingErrorCode,
} from './errors';

export {
  createBookingRepository,
  getBookingRepository,
  type BookingRepository,
} from './repository';

export {
  buildInvoiceNumberSuggestion,
  calculateBookingAmount,
  calculateDurationDays,
  calculateTotalAmount,
  calculateTotalKilometers,
  CONFLICT_BLOCKING_STATUSES,
  CONFLICT_IGNORED_STATUSES,
  createBookingService,
  createConflictService,
  createInvoiceNumberService,
  datesOverlap,
  getBookingService,
  getConflictService,
  getInvoiceNumberService,
  isConflictBlockingStatus,
  type BookingService,
  type BookingServiceDeps,
  type ConflictService,
  type ConflictServiceDeps,
  type GenerateInvoiceNumberOptions,
  type InvoiceNumberService,
  type InvoiceNumberServiceDeps,
  type NextAvailableDateParams,
  type NextAvailableDateResult,
} from './service';

export {
  countBookings,
  createBooking,
  deleteBooking,
  getBooking,
  getBookingByInvoiceNumber,
  getBookingWithVehicle,
  listBookings,
  searchBookings,
  updateBooking,
} from './actions';

export {
  BookingDetailActions,
  BookingDetailPage,
  BookingDetailSkeleton,
  BookingForm,
  BookingList,
  BookingListSkeleton,
  BookingStatusBadge,
  CreateBookingForm,
  CreateBookingPage,
  CreateBookingSkeleton,
  EditBookingPage,
} from './components';

export {
  bookingListFiltersSchema,
  bookingListQuerySchema,
  createBookingSchema,
  updateBookingSchema,
  type BookingListFilterValues,
  type BookingListQueryValues,
  type CreateBookingValues,
  type UpdateBookingValues,
} from '@/validations';
