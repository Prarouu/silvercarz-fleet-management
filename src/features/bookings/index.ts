/**
 * Bookings feature public exports.
 *
 * Types and validation only in this phase — no UI or CRUD yet.
 */

export type {
  Booking,
  BookingCreateInput,
  BookingListFilters,
  BookingStatus,
  BookingUpdateInput,
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
  bookingListFiltersSchema,
  createBookingSchema,
  updateBookingSchema,
  type BookingListFilterValues,
  type CreateBookingValues,
  type UpdateBookingValues,
} from '@/validations';
