/**
 * Customer booking REQUEST validation.
 *
 * Intentionally narrower than admin `createBookingSchema`:
 * customers never supply status, pricing, invoice number, or payment fields.
 */

import { z } from 'zod';

import {
  contactNumberSchema,
  entityIdSchema,
  isoDateSchema,
  refineDateRange,
  rentalModeSchema,
  requiredString,
  zipCodeSchema,
} from '@/validations/shared';

export const customerBookingRequestSchema = z
  .object({
    vehicleId: entityIdSchema,
    deliveryDate: isoDateSchema,
    returnDate: isoDateSchema,
    mode: rentalModeSchema,
    customerName: requiredString('Full name is required.').max(
      160,
      'Full name must be at most 160 characters.',
    ),
    contactNumber: contactNumberSchema,
    address: requiredString('Address is required.').max(
      240,
      'Address must be at most 240 characters.',
    ),
    city: requiredString('City is required.').max(80, 'City must be at most 80 characters.'),
    state: requiredString('State is required.').max(80, 'State must be at most 80 characters.'),
    zipCode: zipCodeSchema,
    placeToVisit: z.string().trim().max(200, 'Must be at most 200 characters.'),
  })
  .superRefine((data, ctx) => {
    refineDateRange(data.deliveryDate, data.returnDate, ctx, ['returnDate']);
  });

export type CustomerBookingRequestInput = z.infer<typeof customerBookingRequestSchema>;

/** Date-window check before the full request form is complete. */
export const customerBookingDatesSchema = z
  .object({
    vehicleId: entityIdSchema,
    deliveryDate: isoDateSchema,
    returnDate: isoDateSchema,
  })
  .superRefine((data, ctx) => {
    refineDateRange(data.deliveryDate, data.returnDate, ctx, ['returnDate']);
  });

export type CustomerBookingDatesInput = z.infer<typeof customerBookingDatesSchema>;

/** Month-window booked-date lookup for the availability calendar. */
export const customerVehicleBookedDatesSchema = z
  .object({
    vehicleId: entityIdSchema,
    fromDate: isoDateSchema,
    toDate: isoDateSchema,
  })
  .superRefine((data, ctx) => {
    refineDateRange(data.fromDate, data.toDate, ctx, ['toDate']);
  });

export type CustomerVehicleBookedDatesInput = z.infer<typeof customerVehicleBookedDatesSchema>;
