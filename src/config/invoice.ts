/**
 * Invoice numbering configuration.
 *
 * Format: `{prefix}-{year}-{sequence}` → e.g. SC-2026-0001
 * Override the company prefix via `INVOICE_COMPANY_PREFIX` (server env).
 */

export const invoiceConfig = {
  /** Default company prefix when env is unset. */
  prefix: 'SC',

  /** Zero-pad width for the yearly sequence segment (XXXX). */
  sequencePadding: 4,

  /** Inclusive year bounds accepted by the database allocator. */
  minYear: 2000,
  maxYear: 2100,
} as const;

export type InvoiceConfig = typeof invoiceConfig;

/**
 * Resolves the active company prefix.
 * Prefers `INVOICE_COMPANY_PREFIX`, then an explicit override, then the default.
 * Safe to call only from server code when relying on process.env.
 */
export function resolveInvoicePrefix(override?: string): string {
  const fromEnv = process.env.INVOICE_COMPANY_PREFIX?.trim();
  const raw = override?.trim() || fromEnv || invoiceConfig.prefix;
  return raw.toUpperCase();
}

/** UTC calendar year used for yearly sequence buckets. */
export function resolveInvoiceYear(issuedOn?: string): number {
  const iso = issuedOn?.trim() || new Date().toISOString().slice(0, 10);
  const year = Number.parseInt(iso.slice(0, 4), 10);

  if (!Number.isFinite(year) || year < invoiceConfig.minYear || year > invoiceConfig.maxYear) {
    return new Date().getUTCFullYear();
  }

  return year;
}

/** Formats an allocated sequence into the canonical invoice number. */
export function formatInvoiceNumber(params: {
  readonly prefix: string;
  readonly year: number;
  readonly sequence: number;
  readonly padding?: number;
}): string {
  const padding = params.padding ?? invoiceConfig.sequencePadding;
  const prefix = params.prefix.trim().toUpperCase();
  const sequence = String(params.sequence).padStart(padding, '0');
  return `${prefix}-${params.year}-${sequence}`;
}
