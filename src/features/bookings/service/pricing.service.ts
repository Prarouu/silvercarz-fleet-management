/**
 * Centralized Pricing Engine — single source of truth for booking money math.
 *
 * Every monetary value related to bookings (duration charges, grand total,
 * remaining balance) must flow through this module.
 *
 * Pure functions (no `server-only`) so the booking form and detail UI can call
 * the engine without duplicating formulas. Persistence still happens in
 * BookingService — this layer never writes to the database.
 *
 * Extension points (intentionally stubbed at zero / passthrough today):
 * - Discounts → `discountAmount`
 * - GST / tax → `gstRate` / `gstAmount`
 */

import { createBookingValidationError } from '@/features/bookings/errors';
import { VALIDATION_MESSAGES } from '@/validations/shared';

/** Inputs the Pricing Engine accepts. */
export type PricingInput = {
  /** Daily rental rate (maps to `bookings.daily_charge`). */
  readonly dailyRate: number;
  readonly deliveryDate: string;
  readonly returnDate: string;
  /** Amount already paid toward the hire (maps to `bookings.booking_amount`). */
  readonly amountPaid?: number | null;
  /** Future: absolute discount applied before tax. */
  readonly discountAmount?: number | null;
  /** Future: GST rate as a fraction (e.g. `0.18` for 18%). */
  readonly gstRate?: number | null;
};

/**
 * Complete pricing summary returned by the engine.
 * Future fields (discount, GST) are present so callers stay stable.
 */
export type PricingSummary = {
  readonly rentalDays: number;
  readonly dailyRate: number;
  /** Daily rate × rental days. */
  readonly rentalCharge: number;
  /** Rental charge before discount / tax. */
  readonly subtotal: number;
  /** Future discount (0 today). */
  readonly discountAmount: number;
  /** Subtotal after discount, before GST. */
  readonly taxableAmount: number;
  /** Future GST (0 today). */
  readonly gstRate: number;
  readonly gstAmount: number;
  /** Final hire total (subtotal − discount + GST). */
  readonly grandTotal: number;
  /** Amount paid toward the hire (`booking_amount`). */
  readonly amountPaid: number;
  /** Grand total − amount paid. */
  readonly remainingBalance: number;
};

/** Minimal booking-shaped source for detail / service rematerialization. */
export type PricingBookingSource = {
  readonly daily_charge: number;
  readonly delivery_date: string;
  readonly return_date: string;
  readonly booking_amount?: number | null;
};

export type PricingService = {
  calculate(input: PricingInput): PricingSummary;
  preview(
    input: Partial<PricingInput> & Pick<PricingInput, 'deliveryDate' | 'returnDate'>,
  ): PricingSummary;
  fromBooking(booking: PricingBookingSource): PricingSummary;
  calculateRentalDays(deliveryDate: string, returnDate: string): number;
  roundMoney(value: number): number;
};

/**
 * Round monetary values to 2 decimal places (paise-safe).
 * Shared by every pricing path so GST / discounts stay consistent later.
 */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Inclusive rental duration in days.
 * Same-day delivery and return counts as 1 day (never 0 / negative).
 *
 * Schedule engines (Status / Conflict / Availability) also treat the hire
 * window as closed-interval inclusive — pricing stays aligned with occupancy.
 */
export function calculateRentalDays(deliveryDate: string, returnDate: string): number {
  const start = Date.parse(`${deliveryDate}T00:00:00.000Z`);
  const end = Date.parse(`${returnDate}T00:00:00.000Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }

  const diffDays = Math.round((end - start) / 86_400_000);
  return Math.max(1, diffDays + 1);
}

/** @deprecated Prefer `calculateRentalDays`. */
export const calculateDurationDays = calculateRentalDays;

function assertNonNegative(value: number, message: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw createBookingValidationError(message);
  }
}

/** Strict validation used by BookingService before persistence. */
export function assertPricingInput(input: PricingInput): void {
  assertNonNegative(input.dailyRate, 'Daily rate must be zero or greater.');

  if (input.amountPaid != null) {
    assertNonNegative(input.amountPaid, 'Booking amount must be zero or greater.');
  }

  if (input.discountAmount != null) {
    assertNonNegative(input.discountAmount, 'Discount must be zero or greater.');
  }

  if (input.gstRate != null) {
    assertNonNegative(input.gstRate, 'GST rate must be zero or greater.');
  }

  const start = Date.parse(`${input.deliveryDate}T00:00:00.000Z`);
  const end = Date.parse(`${input.returnDate}T00:00:00.000Z`);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw createBookingValidationError(VALIDATION_MESSAGES.isoDate);
  }

  if (end < start) {
    throw createBookingValidationError(VALIDATION_MESSAGES.returnAfterDelivery);
  }
}

function buildPricingSummary(
  input: PricingInput,
  options?: { readonly strict?: boolean },
): PricingSummary {
  if (options?.strict) {
    assertPricingInput(input);
  }

  const dailyRate = Number.isFinite(input.dailyRate) && input.dailyRate >= 0 ? input.dailyRate : 0;
  const amountPaid =
    input.amountPaid != null && Number.isFinite(input.amountPaid) && input.amountPaid >= 0
      ? input.amountPaid
      : 0;
  const discountAmount =
    input.discountAmount != null &&
    Number.isFinite(input.discountAmount) &&
    input.discountAmount >= 0
      ? input.discountAmount
      : 0;
  const gstRate =
    input.gstRate != null && Number.isFinite(input.gstRate) && input.gstRate >= 0
      ? input.gstRate
      : 0;

  const rentalDays = calculateRentalDays(input.deliveryDate, input.returnDate);
  const rentalCharge = roundMoney(dailyRate * Math.max(rentalDays, 0));
  const subtotal = rentalCharge;
  const taxableAmount = roundMoney(Math.max(0, subtotal - discountAmount));
  const gstAmount = roundMoney(taxableAmount * gstRate);
  const grandTotal = roundMoney(taxableAmount + gstAmount);
  const remainingBalance = roundMoney(grandTotal - amountPaid);

  return {
    rentalDays,
    dailyRate: roundMoney(dailyRate),
    rentalCharge,
    subtotal,
    discountAmount: roundMoney(discountAmount),
    taxableAmount,
    gstRate,
    gstAmount,
    grandTotal,
    amountPaid: roundMoney(amountPaid),
    remainingBalance,
  };
}

/**
 * Strict pricing calculation — validates inputs then returns the full summary.
 * Used by BookingService on create / update.
 */
export function calculatePricing(input: PricingInput): PricingSummary {
  return buildPricingSummary(input, { strict: true });
}

/**
 * Lenient preview for live form updates.
 * Incomplete / invalid fields degrade to zero rather than throwing.
 */
export function previewPricing(
  input: Partial<PricingInput> & {
    readonly deliveryDate?: string | null;
    readonly returnDate?: string | null;
  },
): PricingSummary {
  const deliveryDate = input.deliveryDate?.trim() || '1970-01-01';
  const returnDate = input.returnDate?.trim() || deliveryDate;

  return buildPricingSummary(
    {
      dailyRate: input.dailyRate ?? 0,
      deliveryDate,
      returnDate,
      amountPaid: input.amountPaid,
      discountAmount: input.discountAmount,
      gstRate: input.gstRate,
    },
    { strict: false },
  );
}

/** Rematerialize pricing from a persisted booking row (or booking-shaped object). */
export function pricingFromBooking(booking: PricingBookingSource): PricingSummary {
  return calculatePricing({
    dailyRate: booking.daily_charge,
    deliveryDate: booking.delivery_date,
    returnDate: booking.return_date,
    amountPaid: booking.booking_amount,
  });
}

/**
 * Map engine output onto persisted booking columns.
 *
 * Strategy:
 * - Persist inputs + historical snapshots staff expect on the invoice row.
 * - Do not invent columns for line items — rematerialize via `pricingFromBooking`.
 *
 * | Engine field        | DB column           | Why persist                          |
 * | ------------------- | ------------------- | ------------------------------------ |
 * | dailyRate           | daily_charge        | Rate at time of hire (input)         |
 * | rentalDays          | duration            | Snapshot for reporting / list views  |
 * | amountPaid          | booking_amount      | Advance / amount collected           |
 * | grandTotal          | total_amount        | Invoice total snapshot               |
 *
 * Derived display-only (recalculated): rentalCharge, subtotal, remainingBalance,
 * GST / discount placeholders.
 */
export function pricingToPersistedFields(summary: PricingSummary): {
  readonly duration: number;
  readonly booking_amount: number;
  readonly total_amount: number;
} {
  return {
    duration: Math.max(1, summary.rentalDays),
    booking_amount: summary.amountPaid,
    total_amount: summary.grandTotal,
  };
}

/**
 * Legacy helper — hire charges only (rental), ignoring amount paid.
 * Prefer `calculatePricing` / `previewPricing`.
 */
export function calculateBookingAmount(params: {
  readonly dailyCharge: number;
  readonly durationDays: number;
}): number {
  return roundMoney(params.dailyCharge * params.durationDays);
}

/** @deprecated Prefer `PricingSummary.grandTotal`. */
export function calculateTotalAmount(bookingAmount: number): number {
  return roundMoney(bookingAmount);
}

export function createPricingService(): PricingService {
  return {
    calculate: calculatePricing,
    preview: previewPricing,
    fromBooking: pricingFromBooking,
    calculateRentalDays,
    roundMoney,
  };
}

let pricingServiceSingleton: PricingService | null = null;

export function getPricingService(): PricingService {
  if (!pricingServiceSingleton) {
    pricingServiceSingleton = createPricingService();
  }

  return pricingServiceSingleton;
}
