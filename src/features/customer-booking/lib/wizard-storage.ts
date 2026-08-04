/**
 * Session-scoped draft for the customer booking wizard.
 * Preserves dates/details across soft navigations within the same tab.
 */

import type { RentalMode } from '@/types';

export type BookingWizardDraft = {
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly mode: RentalMode;
  readonly customerName: string;
  readonly contactNumber: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly placeToVisit: string;
};

export type BookingWizardStep = 'dates' | 'details' | 'review';

const STORAGE_PREFIX = 'sc-booking-request:';

function storageKey(vehicleId: string): string {
  return `${STORAGE_PREFIX}${vehicleId}`;
}

export function readBookingWizardDraft(vehicleId: string): Partial<BookingWizardDraft> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey(vehicleId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<BookingWizardDraft>;
  } catch {
    return null;
  }
}

export function writeBookingWizardDraft(
  vehicleId: string,
  draft: Partial<BookingWizardDraft>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = readBookingWizardDraft(vehicleId) ?? {};
    window.sessionStorage.setItem(storageKey(vehicleId), JSON.stringify({ ...existing, ...draft }));
  } catch {
    // Ignore quota / private-mode failures — form still works in memory.
  }
}

export function clearBookingWizardDraft(vehicleId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(storageKey(vehicleId));
  } catch {
    // no-op
  }
}

export function isBookingWizardStep(value: string | null | undefined): value is BookingWizardStep {
  return value === 'dates' || value === 'details' || value === 'review';
}

/** Safe for Server Components — not a client module. */
export function parseBookingWizardStep(value: string | string[] | undefined): BookingWizardStep {
  const raw = Array.isArray(value) ? value[0] : value;
  return isBookingWizardStep(raw) ? raw : 'dates';
}
