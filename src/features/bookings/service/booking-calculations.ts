/**
 * Pure booking calculation helpers (no I/O).
 *
 * Used by the booking service to fill derived fields before persistence.
 * Invoice formatting lives in `@/config/invoice` and the invoice number service.
 */

import { formatInvoiceNumber, invoiceConfig, resolveInvoiceYear } from '@/config/invoice';

/**
 * Inclusive rental duration in days.
 * Same-day delivery and return counts as 1 day.
 */
export function calculateDurationDays(deliveryDate: string, returnDate: string): number {
  const start = Date.parse(`${deliveryDate}T00:00:00.000Z`);
  const end = Date.parse(`${returnDate}T00:00:00.000Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }

  const diffDays = Math.round((end - start) / 86_400_000);
  return Math.max(1, diffDays + 1);
}

export function calculateTotalKilometers(
  startOdometer: number | null | undefined,
  endOdometer: number | null | undefined,
): number | null {
  if (startOdometer == null || endOdometer == null) {
    return null;
  }

  return endOdometer - startOdometer;
}

/**
 * Hire charges: (daily_charge × duration) + optional km overage.
 * Caution money is tracked separately and is not included here.
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

/** Invoice total for MVP = booking amount (deposit kept separate). */
export function calculateTotalAmount(bookingAmount: number): number {
  return roundMoney(bookingAmount);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a known sequence into the canonical invoice number.
 * Prefer `InvoiceNumberService` for allocation; this is for display / tests only.
 */
export function buildInvoiceNumberSuggestion(params: {
  readonly prefix?: string;
  readonly sequence: number;
  readonly issuedOn?: string;
}): string {
  return formatInvoiceNumber({
    prefix: (params.prefix ?? invoiceConfig.prefix).toUpperCase(),
    year: resolveInvoiceYear(params.issuedOn),
    sequence: params.sequence,
  });
}
