/**
 * Booking document domain errors.
 * Safe for UI display — never wrap raw Supabase / Storage messages.
 */

import { AppError, ERROR_CODES } from '@/lib/errors';

export const BOOKING_DOCUMENT_ERROR_CODES = {
  notFound: 'booking_document_not_found',
  storageFailure: 'booking_document_storage_failure',
  databaseFailure: 'booking_document_database_failure',
  ineligible: 'booking_document_ineligible',
  missingRequired: 'booking_document_missing_required',
  unauthorized: 'unauthorized_booking_document_access',
  validation: ERROR_CODES.validation,
} as const;

export type BookingDocumentErrorCode =
  (typeof BOOKING_DOCUMENT_ERROR_CODES)[keyof typeof BOOKING_DOCUMENT_ERROR_CODES];

export function createBookingDocumentNotFoundError(): AppError {
  return new AppError('Document not found.', BOOKING_DOCUMENT_ERROR_CODES.notFound);
}

export function createBookingDocumentStorageFailureError(
  message?: string,
  cause?: unknown,
): AppError {
  return new AppError(
    message ?? 'Unable to upload the document. Please try again.',
    BOOKING_DOCUMENT_ERROR_CODES.storageFailure,
    { cause },
  );
}

export function createBookingDocumentDatabaseFailureError(cause?: unknown): AppError {
  return new AppError(
    'Unable to save document details. Please try again.',
    BOOKING_DOCUMENT_ERROR_CODES.databaseFailure,
    { cause },
  );
}

export function createBookingDocumentIneligibleError(message?: string): AppError {
  return new AppError(
    message ?? 'Documents cannot be changed for this booking request.',
    BOOKING_DOCUMENT_ERROR_CODES.ineligible,
  );
}

export function createBookingDocumentMissingRequiredError(): AppError {
  return new AppError(
    'Please upload all required documents before continuing.',
    BOOKING_DOCUMENT_ERROR_CODES.missingRequired,
  );
}

export function createBookingDocumentUnauthorizedError(): AppError {
  return new AppError(
    'You do not have permission to access these documents.',
    BOOKING_DOCUMENT_ERROR_CODES.unauthorized,
  );
}

export function createBookingDocumentValidationError(message: string): AppError {
  return new AppError(message, BOOKING_DOCUMENT_ERROR_CODES.validation);
}
