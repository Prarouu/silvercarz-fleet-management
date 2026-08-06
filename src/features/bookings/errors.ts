/**
 * Booking domain errors.
 *
 * Safe for UI display — never wrap raw Supabase / Postgres messages here.
 */

import { formatDate } from '@/lib/format';
import { AppError, ERROR_CODES } from '@/lib/errors';
import type { BookingConflict } from '@/types/booking';
import {
  BOOKING_DISPLAY_STATUS_LABELS,
  resolveBookingDisplayStatus,
} from '@/features/bookings/service/status.service';

export const BOOKING_ERROR_CODES = {
  notFound: 'booking_not_found',
  duplicateInvoice: 'duplicate_invoice',
  invoiceGenerationFailed: 'invoice_generation_failed',
  vehicleUnavailable: 'vehicle_unavailable',
  bookingConflict: 'booking_conflict',
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
    message ?? 'This vehicle is no longer available for the requested dates.',
    BOOKING_ERROR_CODES.vehicleUnavailable,
  );
}

export function createBookingAlreadyProcessedError(): AppError {
  return new AppError('This booking has already been processed.', BOOKING_ERROR_CODES.validation);
}

export function createBookingDocumentsIncompleteError(missingLabels?: readonly string[]): AppError {
  const suffix =
    missingLabels && missingLabels.length > 0 ? ` Missing: ${missingLabels.join(', ')}.` : '';
  return new AppError(
    `Required documents are incomplete.${suffix}`,
    BOOKING_ERROR_CODES.validation,
  );
}

/**
 * Schedule conflict — same code surface as vehicle_unavailable for form UX,
 * with a richer message (dates, invoice, customer, status).
 */
export function createBookingConflictError(
  conflict: BookingConflict,
  messageOverride?: string,
): AppError {
  if (messageOverride) {
    return new AppError(messageOverride, BOOKING_ERROR_CODES.vehicleUnavailable);
  }

  const from = formatDate(conflict.deliveryDate);
  const to = formatDate(conflict.returnDate);
  const display = resolveBookingDisplayStatus({
    status: conflict.status,
    delivery_date: conflict.deliveryDate,
    return_date: conflict.returnDate,
  });
  const statusLabel = BOOKING_DISPLAY_STATUS_LABELS[display];
  const details = [
    conflict.invoiceNumber ? `Invoice ${conflict.invoiceNumber}` : null,
    conflict.customerName || null,
    statusLabel || null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const base = `This vehicle is already booked between ${from} and ${to}.`;
  const message = details ? `${base} (${details})` : base;

  return new AppError(message, BOOKING_ERROR_CODES.vehicleUnavailable);
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
