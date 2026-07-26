/**
 * Booking create / update Zod schemas.
 *
 * Output shapes align with Supabase `bookings` insert/update columns (snake_case).
 */

import { z } from 'zod';

import {
  bookingStatusSchema,
  entityIdSchema,
  invoiceNumberSchema,
  isoDateSchema,
  moneySchema,
  nonNegativeNumberSchema,
  optionalContactNumberSchema,
  optionalNullableStringSchema,
  optionalZipCodeSchema,
  paymentMethodSchema,
  positiveNumberSchema,
  refineDateRange,
  refineOdometerRange,
  rentalModeSchema,
  requiredString,
} from '@/validations/shared';

const bookingFieldsSchema = z.object({
  invoice_number: invoiceNumberSchema,
  vehicle_id: entityIdSchema,
  mode: rentalModeSchema,
  customer_name: requiredString('Customer name is required.').max(
    160,
    'Customer name must be at most 160 characters.',
  ),
  address: optionalNullableStringSchema,
  city: optionalNullableStringSchema,
  state: optionalNullableStringSchema,
  zip_code: optionalZipCodeSchema,
  place_to_visit: optionalNullableStringSchema,
  document_submitted: z.boolean().default(false),
  contact_number: optionalContactNumberSchema,
  invoice_date: isoDateSchema.optional(),
  delivery_date: isoDateSchema,
  return_date: isoDateSchema,
  driver_name: optionalNullableStringSchema,
  daily_charge: moneySchema,
  fuel_range: optionalNullableStringSchema,
  start_odometer: nonNegativeNumberSchema.nullable().optional(),
  end_odometer: nonNegativeNumberSchema.nullable().optional(),
  total_kilometers: nonNegativeNumberSchema.nullable().optional(),
  duration: positiveNumberSchema.nullable().optional(),
  kilometer_rate: moneySchema.nullable().optional(),
  booking_amount: moneySchema.default(0),
  caution_money: moneySchema.default(0),
  payment_method: paymentMethodSchema.nullable().optional(),
  total_amount: moneySchema.default(0),
  status: bookingStatusSchema.default('confirmed'),
  notes: optionalNullableStringSchema,
  created_by: entityIdSchema.nullable().optional(),
});

export const createBookingSchema = bookingFieldsSchema.superRefine((data, ctx) => {
  refineDateRange(data.delivery_date, data.return_date, ctx);
  refineOdometerRange(data.start_odometer, data.end_odometer, ctx);
});

export const updateBookingSchema = bookingFieldsSchema.partial().superRefine((data, ctx) => {
  refineDateRange(data.delivery_date, data.return_date, ctx);
  refineOdometerRange(data.start_odometer, data.end_odometer, ctx);
});

/** Form-friendly booking filters (camelCase query params). */
export const bookingListFiltersSchema = z.object({
  search: optionalNullableStringSchema.optional(),
  status: bookingStatusSchema.optional(),
  vehicleId: entityIdSchema.optional(),
  mode: rentalModeSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  deliveryDateFrom: isoDateSchema.optional(),
  deliveryDateTo: isoDateSchema.optional(),
  returnDateFrom: isoDateSchema.optional(),
  returnDateTo: isoDateSchema.optional(),
});

export type CreateBookingValues = z.infer<typeof createBookingSchema>;
export type UpdateBookingValues = z.infer<typeof updateBookingSchema>;
export type BookingListFilterValues = z.infer<typeof bookingListFiltersSchema>;
