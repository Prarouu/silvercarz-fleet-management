/**
 * Bookings feature public exports.
 *
 * Data layer only in this phase — repository, service, Server Actions.
 * No UI / pages yet.
 */

export type {
  Booking,
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
  createBookingDatabaseFailureError,
  createBookingNotFoundError,
  createBookingValidationError,
  createDuplicateInvoiceError,
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
  createBookingService,
  getBookingService,
  type BookingService,
  type BookingServiceDeps,
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
  bookingListFiltersSchema,
  bookingListQuerySchema,
  createBookingSchema,
  updateBookingSchema,
  type BookingListFilterValues,
  type BookingListQueryValues,
  type CreateBookingValues,
  type UpdateBookingValues,
} from '@/validations';
