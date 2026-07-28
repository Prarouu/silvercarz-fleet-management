/**
 * Compatibility re-exports for the shared booking form helpers.
 * Prefer `@/features/bookings/lib/booking-form`.
 */

export {
  formatVehicleOptionLabel,
  isVehicleSelectionBlocked,
  BOOKING_PAYMENT_OPTIONS,
  CREATE_BOOKING_PAYMENT_OPTIONS,
  bookingToFormValues,
  createBookingFormDefaults,
  parseOptionalNumber,
  toCreateBookingInput,
  toUpdateBookingInput,
  todayIsoDate,
  validateCreateBookingForm,
  validateUpdateBookingForm,
  type BookingFormFieldErrors,
  type BookingFormValues,
  type CreateBookingFieldErrors,
  type CreateBookingFormValues,
  type VehicleSelectOption,
} from './booking-form';
