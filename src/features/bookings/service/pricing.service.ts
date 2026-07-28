/**
 * Centralized Pricing Engine — single source of truth for booking money math.
 *
 * Every monetary value related to bookings (duration charges, kilometer charges,
 * grand total, remaining balance) must flow through this module.
 *
 * Pure functions (no `server-only`) so the booking form and detail UI can call
 * the engine without duplicating formulas. Persistence still happens in
 * BookingService — this layer never writes to the database.
 *
 * Extension points (intentionally stubbed at zero / passthrough today):
 * - Free / included kilometers → `includedKilometers`
 * - Discounts → `discountAmount`
 * - GST / tax → `gstRate` / `gstAmount`
 */

import { createBookingValidationError } from '@/features/bookings/errors';
import { VALIDATION_MESSAGES } from '@/validations/shared';

/** Inputs the Pricing Engine accepts. */
export type PricingInput = {
  /** Daily rental rate (maps to `bookings.daily_charge`). */
  readonly dailyRate: number;
  /** Extra / chargeable kilometer rate (maps to `bookings.kilometer_rate`). */
  readonly extraKilometerRate?: number | null;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly startOdometer?: number | null;
  readonly endOdometer?: number | null;
  /**
   * Amount already paid toward the hire (maps to `bookings.booking_amount`).
   * Does not include security deposit.
   */
  readonly amountPaid?: number | null;
  /**
   * Security / caution deposit (maps to `bookings.caution_money`).
   * Tracked separately — never subtracted from remaining balance.
   */
  readonly securityDeposit?: number | null;
  /**
   * Future: free kilometers included in the daily rate.
   * When set, only kilometers above this threshold are chargeable.
   */
  readonly includedKilometers?: number | null;
  /** Future: absolute discount applied before tax. */
  readonly discountAmount?: number | null;
  /** Future: GST rate as a fraction (e.g. `0.18` for 18%). */
  readonly gstRate?: number | null;
};

/**
 * Complete pricing summary returned by the engine.
 * Future fields (included KM, discount, GST) are present so callers stay stable.
 */
export type PricingSummary = {
  readonly rentalDays: number;
  readonly dailyRate: number;
  /** Daily rate × rental days. */
  readonly rentalCharge: number;
  readonly totalKilometers: number | null;
  /** Future free-KM allowance (null when not configured). */
  readonly includedKilometers: number | null;
  /**
   * Kilometers beyond the free allowance.
   * Today equals `totalKilometers` (no free KM yet).
   */
  readonly extraKilometers: number | null;
  /** Kilometers that incur the kilometer rate (alias of extra for now). */
  readonly chargeableKilometers: number | null;
  readonly kilometerRate: number;
  readonly kilometerCharge: number;
  /** Rental + kilometer charges before discount / tax. */
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
  /** Security deposit (`caution_money`) — separate from balance. */
  readonly securityDeposit: number;
  /** Grand total − amount paid. Never subtracts security deposit. */
  readonly remainingBalance: number;
};

/** Minimal booking-shaped source for detail / service rematerialization. */
export type PricingBookingSource = {
  readonly daily_charge: number;
  readonly kilometer_rate?: number | null;
  readonly delivery_date: string;
  readonly return_date: string;
  readonly start_odometer?: number | null;
  readonly end_odometer?: number | null;
  readonly booking_amount?: number | null;
  readonly caution_money?: number | null;
};

export type PricingService = {
  calculate(input: PricingInput): PricingSummary;
  preview(
    input: Partial<PricingInput> & Pick<PricingInput, 'deliveryDate' | 'returnDate'>,
  ): PricingSummary;
  fromBooking(booking: PricingBookingSource): PricingSummary;
  calculateRentalDays(deliveryDate: string, returnDate: string): number;
  calculateTotalKilometers(
    startOdometer: number | null | undefined,
    endOdometer: number | null | undefined,
  ): number | null;
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

/**
 * Total kilometers from odometer pair.
 * Returns `null` when either reading is missing. Never returns a negative.
 */
export function calculateTotalKilometers(
  startOdometer: number | null | undefined,
  endOdometer: number | null | undefined,
): number | null {
  if (startOdometer == null || endOdometer == null) {
    return null;
  }

  if (endOdometer < startOdometer) {
    return null;
  }

  return roundMoney(endOdometer - startOdometer);
}

/**
 * Chargeable kilometers after applying an optional free-KM allowance.
 * Today (no free KM): chargeable === total.
 */
export function calculateChargeableKilometers(
  totalKilometers: number | null,
  includedKilometers: number | null | undefined = null,
): {
  readonly includedKilometers: number | null;
  readonly extraKilometers: number | null;
  readonly chargeableKilometers: number | null;
} {
  if (totalKilometers == null) {
    return {
      includedKilometers: includedKilometers ?? null,
      extraKilometers: null,
      chargeableKilometers: null,
    };
  }

  const included = includedKilometers != null && includedKilometers > 0 ? includedKilometers : 0;
  const extra = Math.max(0, totalKilometers - included);

  return {
    includedKilometers: includedKilometers ?? null,
    extraKilometers: extra,
    chargeableKilometers: extra,
  };
}

function assertNonNegative(value: number, message: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw createBookingValidationError(message);
  }
}

/** Strict validation used by BookingService before persistence. */
export function assertPricingInput(input: PricingInput): void {
  assertNonNegative(input.dailyRate, 'Daily rate must be zero or greater.');

  if (input.extraKilometerRate != null) {
    assertNonNegative(input.extraKilometerRate, 'Kilometer rate must be zero or greater.');
  }

  if (input.startOdometer != null) {
    assertNonNegative(input.startOdometer, VALIDATION_MESSAGES.numberNonNegative);
  }

  if (input.endOdometer != null) {
    assertNonNegative(input.endOdometer, VALIDATION_MESSAGES.numberNonNegative);
  }

  if (
    input.startOdometer != null &&
    input.endOdometer != null &&
    input.endOdometer < input.startOdometer
  ) {
    throw createBookingValidationError(VALIDATION_MESSAGES.odometerOrder);
  }

  if (input.amountPaid != null) {
    assertNonNegative(input.amountPaid, 'Booking amount must be zero or greater.');
  }

  if (input.securityDeposit != null) {
    assertNonNegative(input.securityDeposit, 'Security deposit must be zero or greater.');
  }

  if (input.includedKilometers != null) {
    assertNonNegative(input.includedKilometers, 'Included kilometers must be zero or greater.');
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
  const kilometerRate =
    input.extraKilometerRate != null &&
    Number.isFinite(input.extraKilometerRate) &&
    input.extraKilometerRate >= 0
      ? input.extraKilometerRate
      : 0;
  const amountPaid =
    input.amountPaid != null && Number.isFinite(input.amountPaid) && input.amountPaid >= 0
      ? input.amountPaid
      : 0;
  const securityDeposit =
    input.securityDeposit != null &&
    Number.isFinite(input.securityDeposit) &&
    input.securityDeposit >= 0
      ? input.securityDeposit
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
  const totalKilometers = calculateTotalKilometers(input.startOdometer, input.endOdometer);
  const kmBreakdown = calculateChargeableKilometers(totalKilometers, input.includedKilometers);

  const rentalCharge = roundMoney(dailyRate * Math.max(rentalDays, 0));
  const kilometerCharge = roundMoney(kilometerRate * (kmBreakdown.chargeableKilometers ?? 0));
  const subtotal = roundMoney(rentalCharge + kilometerCharge);
  const taxableAmount = roundMoney(Math.max(0, subtotal - discountAmount));
  const gstAmount = roundMoney(taxableAmount * gstRate);
  const grandTotal = roundMoney(taxableAmount + gstAmount);
  const remainingBalance = roundMoney(grandTotal - amountPaid);

  return {
    rentalDays,
    dailyRate: roundMoney(dailyRate),
    rentalCharge,
    totalKilometers,
    includedKilometers: kmBreakdown.includedKilometers,
    extraKilometers: kmBreakdown.extraKilometers,
    chargeableKilometers: kmBreakdown.chargeableKilometers,
    kilometerRate: roundMoney(kilometerRate),
    kilometerCharge,
    subtotal,
    discountAmount: roundMoney(discountAmount),
    taxableAmount,
    gstRate,
    gstAmount,
    grandTotal,
    amountPaid: roundMoney(amountPaid),
    securityDeposit: roundMoney(securityDeposit),
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
      extraKilometerRate: input.extraKilometerRate,
      deliveryDate,
      returnDate,
      startOdometer: input.startOdometer,
      endOdometer: input.endOdometer,
      amountPaid: input.amountPaid,
      securityDeposit: input.securityDeposit,
      includedKilometers: input.includedKilometers,
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
    extraKilometerRate: booking.kilometer_rate,
    deliveryDate: booking.delivery_date,
    returnDate: booking.return_date,
    startOdometer: booking.start_odometer,
    endOdometer: booking.end_odometer,
    amountPaid: booking.booking_amount,
    securityDeposit: booking.caution_money,
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
 * | kilometerRate       | kilometer_rate      | Rate at time of hire (input)         |
 * | rentalDays          | duration            | Snapshot for reporting / list views  |
 * | totalKilometers     | total_kilometers    | Snapshot when odometers recorded     |
 * | amountPaid          | booking_amount      | Advance / amount collected           |
 * | securityDeposit     | caution_money       | Deposit (separate from balance)      |
 * | grandTotal          | total_amount        | Invoice total snapshot               |
 *
 * Derived display-only (recalculated): rentalCharge, kilometerCharge,
 * subtotal, remainingBalance, GST / discount placeholders.
 */
/** Map engine output onto persisted booking money / distance columns. */
export function pricingToPersistedFields(summary: PricingSummary): {
  readonly duration: number;
  readonly total_kilometers: number | null;
  readonly booking_amount: number;
  readonly caution_money: number;
  readonly total_amount: number;
} {
  return {
    duration: Math.max(1, summary.rentalDays),
    total_kilometers: summary.totalKilometers,
    booking_amount: summary.amountPaid,
    caution_money: summary.securityDeposit,
    total_amount: summary.grandTotal,
  };
}

/**
 * Legacy helper — hire charges only (rental + km), ignoring amount paid.
 * Prefer `calculatePricing` / `previewPricing`.
 */
export function calculateBookingAmount(params: {
  readonly dailyCharge: number;
  readonly durationDays: number;
  readonly kilometerRate?: number | null;
  readonly totalKilometers?: number | null;
}): number {
  const base = params.dailyCharge * params.durationDays;
  const kmCharge = (params.kilometerRate ?? 0) * (params.totalKilometers ?? 0);
  return roundMoney(base + kmCharge);
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
    calculateTotalKilometers,
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
