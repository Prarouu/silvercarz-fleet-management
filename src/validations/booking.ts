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
  optionalContactNumberSchema,
  optionalNullableStringSchema,
  optionalZipCodeSchema,
  paymentMethodSchema,
  positiveNumberSchema,
  refineDateRange,
  rentalModeSchema,
  requiredString,
} from '@/validations/shared';

/** List filter values — Status Engine display statuses (+ legacy DB enums). */
const bookingListStatusSchema = z.enum([
  'upcoming',
  'active',
  'completed',
  'cancelled',
  'draft',
  'confirmed',
  'ongoing',
]);

const bookingFieldsSchema = z.object({
  invoice_number: invoiceNumberSchema.optional(),
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
  duration: positiveNumberSchema.nullable().optional(),
  booking_amount: moneySchema.default(0),
  payment_method: paymentMethodSchema.nullable().optional(),
  total_amount: moneySchema.default(0),
  status: bookingStatusSchema.default('confirmed'),
  notes: optionalNullableStringSchema,
  created_by: entityIdSchema.nullable().optional(),
});

export const createBookingSchema = bookingFieldsSchema.superRefine((data, ctx) => {
  refineDateRange(data.delivery_date, data.return_date, ctx);
});

export const updateBookingSchema = bookingFieldsSchema.partial().superRefine((data, ctx) => {
  refineDateRange(data.delivery_date, data.return_date, ctx);
});

/** Form-friendly booking filters (camelCase query params). */
export const bookingListFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: bookingListStatusSchema.optional(),
  vehicleId: entityIdSchema.optional(),
  mode: rentalModeSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  deliveryDateFrom: isoDateSchema.optional(),
  deliveryDateTo: isoDateSchema.optional(),
  returnDateFrom: isoDateSchema.optional(),
  returnDateTo: isoDateSchema.optional(),
  includeCancelled: z.boolean().optional(),
  cursor: z.string().trim().min(1).optional(),
});

export const bookingSortFieldSchema = z.enum([
  'invoice_date',
  'delivery_date',
  'return_date',
  'created_at',
  'customer_name',
  'invoice_number',
]);

/** Full list query: filters + pagination + sorting. */
export const bookingListQuerySchema = bookingListFiltersSchema.extend({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  sortBy: bookingSortFieldSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateBookingValues = z.infer<typeof createBookingSchema>;
export type UpdateBookingValues = z.infer<typeof updateBookingSchema>;
export type BookingListFilterValues = z.infer<typeof bookingListFiltersSchema>;
export type BookingListQueryValues = z.infer<typeof bookingListQuerySchema>;
