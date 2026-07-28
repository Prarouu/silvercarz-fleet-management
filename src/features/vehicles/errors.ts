/**
 * Vehicle domain errors.
 *
 * Safe for UI display — never wrap raw Supabase / Postgres messages here.
 */

import { AppError, ERROR_CODES } from '@/lib/errors';

export const VEHICLE_ERROR_CODES = {
  notFound: 'vehicle_not_found',
  duplicateNumber: 'duplicate_vehicle_number',
  inactive: 'inactive_vehicle',
  unauthorized: 'unauthorized_vehicle_access',
  databaseFailure: 'database_failure',
  storageFailure: 'storage_failure',
  validation: ERROR_CODES.validation,
} as const;

export type VehicleErrorCode = (typeof VEHICLE_ERROR_CODES)[keyof typeof VEHICLE_ERROR_CODES];

export function createVehicleNotFoundError(): AppError {
  return new AppError('Vehicle not found.', VEHICLE_ERROR_CODES.notFound);
}

export function createDuplicateVehicleNumberError(vehicleNumber?: string): AppError {
  const suffix = vehicleNumber ? ` (${vehicleNumber})` : '';
  return new AppError(
    `A vehicle with this registration number already exists${suffix}.`,
    VEHICLE_ERROR_CODES.duplicateNumber,
  );
}

export function createInactiveVehicleError(): AppError {
  return new AppError(
    'This vehicle is inactive and cannot be used for the requested operation.',
    VEHICLE_ERROR_CODES.inactive,
  );
}

export function createVehicleUnavailableForBookingError(
  status?: 'booked' | 'reserved' | 'maintenance' | 'inactive',
): AppError {
  switch (status) {
    case 'maintenance':
      return new AppError(
        'This vehicle is under maintenance and cannot be booked.',
        VEHICLE_ERROR_CODES.inactive,
      );
    case 'inactive':
      return new AppError(
        'This vehicle is inactive and cannot be booked.',
        VEHICLE_ERROR_CODES.inactive,
      );
    case 'booked':
      return new AppError(
        'This vehicle is currently booked and cannot be selected.',
        VEHICLE_ERROR_CODES.inactive,
      );
    case 'reserved':
      return new AppError(
        'This vehicle is reserved for another hire and cannot be selected.',
        VEHICLE_ERROR_CODES.inactive,
      );
    default:
      return new AppError(
        'This vehicle is not available for booking.',
        VEHICLE_ERROR_CODES.inactive,
      );
  }
}

export function createInvalidAvailabilityStatusError(): AppError {
  return new AppError('Select a valid availability status.', VEHICLE_ERROR_CODES.validation);
}

export function createUnauthorizedVehicleAccessError(): AppError {
  return new AppError(
    'You do not have permission to access this vehicle.',
    VEHICLE_ERROR_CODES.unauthorized,
  );
}

export function createVehicleDatabaseFailureError(cause?: unknown): AppError {
  return new AppError(
    'Unable to complete the vehicle operation. Please try again.',
    VEHICLE_ERROR_CODES.databaseFailure,
    { cause },
  );
}

export function createVehicleStorageFailureError(message?: string, cause?: unknown): AppError {
  return new AppError(
    message ?? 'Unable to upload the vehicle image. Please try again.',
    VEHICLE_ERROR_CODES.storageFailure,
    { cause },
  );
}

export function createVehicleValidationError(message: string): AppError {
  return new AppError(message, VEHICLE_ERROR_CODES.validation);
}
