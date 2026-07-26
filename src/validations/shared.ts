/**
 * Shared domain validation primitives.
 *
 * Compose these in booking/vehicle schemas and future feature forms.
 * Keep messages professional and consistent — avoid vague "Invalid input".
 */

import { z } from 'zod';

import {
  BOOKING_STATUS_VALUES,
  FUEL_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  RENTAL_MODE_VALUES,
  VEHICLE_AVAILABILITY_STATUS_VALUES,
} from '@/types/enums';

import { phoneSchema, uuidSchema } from '@/validations/common';

export const VALIDATION_MESSAGES = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  uuid: 'Enter a valid id.',
  phone: 'Enter a valid phone number.',
  zipCode: 'Enter a valid 6-digit PIN code.',
  isoDate: 'Enter a valid date (YYYY-MM-DD).',
  moneyNonNegative: 'Amount must be zero or greater.',
  moneyPositive: 'Amount must be greater than zero.',
  numberNonNegative: 'Value must be zero or greater.',
  numberPositive: 'Value must be greater than zero.',
  odometerOrder: 'End odometer must be greater than or equal to start odometer.',
  returnAfterDelivery: 'Return date must be on or after the delivery date.',
  invoiceNumber: 'Enter a valid invoice number.',
  vehicleNumber: 'Enter a valid vehicle registration number.',
  fuelType: 'Select a valid fuel type.',
  vehicleAvailability: 'Select a valid availability status.',
  rentalMode: 'Select a valid rental mode.',
  paymentMethod: 'Select a valid payment method.',
  bookingStatus: 'Select a valid booking status.',
} as const;

/** Required trimmed string with a custom message. */
export function requiredString(message: string = VALIDATION_MESSAGES.required) {
  return z.string().trim().min(1, message);
}

/** Optional trimmed string; blank values become `null`. */
export const optionalNullableStringSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

/** ISO calendar date (`YYYY-MM-DD`) as stored on Postgres `date` columns. */
export const isoDateSchema = z
  .string()
  .trim()
  .pipe(z.iso.date({ error: VALIDATION_MESSAGES.isoDate }));

/** Indian PIN code (6 digits). */
export const zipCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, VALIDATION_MESSAGES.zipCode);

export const optionalZipCodeSchema = z.union([
  z.literal('').transform(() => null),
  zipCodeSchema,
  z.null(),
  z.undefined().transform(() => null),
]);

/** Money amount ≥ 0 (INR rupees; fractional paise allowed). */
export const moneySchema = z
  .number({ error: VALIDATION_MESSAGES.moneyNonNegative })
  .finite()
  .nonnegative(VALIDATION_MESSAGES.moneyNonNegative);

/** Money amount > 0. */
export const positiveMoneySchema = z
  .number({ error: VALIDATION_MESSAGES.moneyPositive })
  .finite()
  .positive(VALIDATION_MESSAGES.moneyPositive);

/** Non-negative decimal (odometer, kilometers, duration). */
export const nonNegativeNumberSchema = z
  .number({ error: VALIDATION_MESSAGES.numberNonNegative })
  .finite()
  .nonnegative(VALIDATION_MESSAGES.numberNonNegative);

/** Positive decimal (duration when set). */
export const positiveNumberSchema = z
  .number({ error: VALIDATION_MESSAGES.numberPositive })
  .finite()
  .positive(VALIDATION_MESSAGES.numberPositive);

export const odometerSchema = nonNegativeNumberSchema;

export const invoiceNumberSchema = requiredString(VALIDATION_MESSAGES.invoiceNumber)
  .max(64, 'Invoice number must be at most 64 characters.')
  .transform((value) => value.replace(/\s+/g, '').toUpperCase());

/** Vehicle registration / plate — trimmed, uppercased, spaces removed. */
export const vehicleNumberSchema = requiredString(VALIDATION_MESSAGES.vehicleNumber)
  .max(32, 'Vehicle number must be at most 32 characters.')
  .regex(/^[A-Za-z0-9\s-]+$/, VALIDATION_MESSAGES.vehicleNumber)
  .transform((value) => value.replace(/\s+/g, '').toUpperCase());

export const fuelTypeSchema = z.enum(FUEL_TYPE_VALUES, {
  error: VALIDATION_MESSAGES.fuelType,
});

export const vehicleAvailabilityStatusSchema = z.enum(VEHICLE_AVAILABILITY_STATUS_VALUES, {
  error: VALIDATION_MESSAGES.vehicleAvailability,
});

export const rentalModeSchema = z.enum(RENTAL_MODE_VALUES, {
  error: VALIDATION_MESSAGES.rentalMode,
});

export const paymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES, {
  error: VALIDATION_MESSAGES.paymentMethod,
});

export const bookingStatusSchema = z.enum(BOOKING_STATUS_VALUES, {
  error: VALIDATION_MESSAGES.bookingStatus,
});

export const contactNumberSchema = phoneSchema;

export const optionalContactNumberSchema = z.union([
  z.literal('').transform(() => null),
  contactNumberSchema,
  z.null(),
  z.undefined().transform(() => null),
]);

export const entityIdSchema = uuidSchema;

/**
 * Ensures `returnDate >= deliveryDate` when both are present.
 * Use inside `superRefine` on booking create/update schemas.
 */
export function refineDateRange(
  deliveryDate: string | undefined,
  returnDate: string | undefined,
  ctx: z.RefinementCtx,
  path: Array<string | number> = ['return_date'],
): void {
  if (!deliveryDate || !returnDate) {
    return;
  }

  if (returnDate < deliveryDate) {
    ctx.addIssue({
      code: 'custom',
      message: VALIDATION_MESSAGES.returnAfterDelivery,
      path,
    });
  }
}

/**
 * Ensures `endOdometer >= startOdometer` when both are present.
 */
export function refineOdometerRange(
  startOdometer: number | null | undefined,
  endOdometer: number | null | undefined,
  ctx: z.RefinementCtx,
  path: Array<string | number> = ['end_odometer'],
): void {
  if (startOdometer == null || endOdometer == null) {
    return;
  }

  if (endOdometer < startOdometer) {
    ctx.addIssue({
      code: 'custom',
      message: VALIDATION_MESSAGES.odometerOrder,
      path,
    });
  }
}
