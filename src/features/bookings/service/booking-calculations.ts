/**
 * Invoice number formatting helpers (pure, no I/O).
 *
 * Pricing math lives in `pricing.service.ts` — import from there.
 * This module re-exports legacy calculation names for older call sites.
 */

import { formatInvoiceNumber, invoiceConfig, resolveInvoiceYear } from '@/config/invoice';

export {
  calculateBookingAmount,
  calculateDurationDays,
  calculateRentalDays,
  calculateTotalAmount,
  calculateTotalKilometers,
  roundMoney,
} from './pricing.service';

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
