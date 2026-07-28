/**
 * Booking domain errors.
 *
 * Safe for UI display — never wrap raw Supabase / Postgres messages here.
 */

import { AppError, ERROR_CODES } from '@/lib/errors';

export const BOOKING_ERROR_CODES = {
  notFound: 'booking_not_found',
  duplicateInvoice: 'duplicate_invoice',
  invoiceGenerationFailed: 'invoice_generation_failed',
  vehicleUnavailable: 'vehicle_unavailable',
  invalidDates: 'invalid_booking_dates',
  unauthorized: 'unauthorized_booking_access',
  databaseFailure: 'database_failure',
  validation: ERROR_CODES.validation,
} as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[keyof typeof BOOKING_ERROR_CODES];

export function createBookingNotFoundError(): AppError {
  return new AppError('Booking not found.', BOOKING_ERROR_CODES.notFound);
}

export function createDuplicateInvoiceError(invoiceNumber?: string): AppError {
  const suffix = invoiceNumber ? ` (${invoiceNumber})` : '';
  return new AppError(
    `A booking with this invoice number already exists${suffix}.`,
    BOOKING_ERROR_CODES.duplicateInvoice,
  );
}

export function createInvoiceGenerationError(cause?: unknown): AppError {
  return new AppError(
    'Unable to generate an invoice number. Please try again.',
    BOOKING_ERROR_CODES.invoiceGenerationFailed,
    { cause },
  );
}

export function createVehicleUnavailableError(message?: string): AppError {
  return new AppError(
    message ?? 'This vehicle is not available for the selected dates.',
    BOOKING_ERROR_CODES.vehicleUnavailable,
  );
}

export function createInvalidBookingDatesError(message?: string): AppError {
  return new AppError(
    message ?? 'Return date must be on or after the delivery date.',
    BOOKING_ERROR_CODES.invalidDates,
  );
}

export function createUnauthorizedBookingAccessError(): AppError {
  return new AppError(
    'You do not have permission to access this booking.',
    BOOKING_ERROR_CODES.unauthorized,
  );
}

export function createBookingDatabaseFailureError(cause?: unknown): AppError {
  return new AppError(
    'Unable to complete the booking operation. Please try again.',
    BOOKING_ERROR_CODES.databaseFailure,
    { cause },
  );
}

export function createBookingValidationError(message: string): AppError {
  return new AppError(message, BOOKING_ERROR_CODES.validation);
}
