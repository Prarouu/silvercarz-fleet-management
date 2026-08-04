/**
 * Booking wizard step helpers — safe for Server Components.
 *
 * Keep this module free of browser APIs and never import it from
 * `'use client'` files so Next does not treat these exports as client refs.
 */

export type BookingWizardStep = 'dates' | 'details' | 'review';

export function isBookingWizardStep(value: string | null | undefined): value is BookingWizardStep {
  return value === 'dates' || value === 'details' || value === 'review';
}

export function parseBookingWizardStep(value: string | string[] | undefined): BookingWizardStep {
  const raw = Array.isArray(value) ? value[0] : value;
  return isBookingWizardStep(raw) ? raw : 'dates';
}
