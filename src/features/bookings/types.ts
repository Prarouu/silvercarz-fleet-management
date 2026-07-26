/**
 * Bookings feature type surface.
 *
 * Domain models live in `@/types` so vehicles, reports, and other modules
 * can share one definition. Re-export here for feature-local imports.
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
} from '@/types';

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
} from '@/types';
