/**
 * Central application configuration.
 *
 * Import from here instead of hardcoding names, formats, or defaults
 * in components and feature modules.
 */

export const appConfig = {
  name: 'Silver Carz',
  companyName: 'Silver Carz',
  title: 'Silver Carz RMS',
  description: 'Internal rental and fleet management system for Silver Carz.',
  version: '0.1.0',

  /** Default page size for list/table queries. */
  defaultPageSize: 20,

  /** date-fns format string used for display dates. */
  dateFormat: 'dd MMM yyyy',

  /** date-fns format string used for date + time display. */
  dateTimeFormat: 'dd MMM yyyy, HH:mm',

  /** ISO 4217 currency code for monetary display. */
  currency: 'INR',

  /** BCP 47 locale for number/currency formatting. */
  locale: 'en-IN',
} as const;

export type AppConfig = typeof appConfig;
