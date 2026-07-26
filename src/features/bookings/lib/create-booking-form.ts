/**
 * Create Booking form defaults, display options, and payload helpers.
 *
 * Validation rules live in `@/validations` — this module only shapes UX values.
 */

import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_VALUES,
  RENTAL_MODES,
  type PaymentMethod,
  type RentalMode,
  type SelectOption,
} from '@/types';
import { createBookingSchema, type CreateBookingValues } from '@/validations';

/** Form field values before Zod parse (empty strings for optional text). */
export type CreateBookingFormValues = {
  invoice_number: string;
  mode: RentalMode;
  invoice_date: string;
  customer_name: string;
  contact_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  document_submitted: boolean;
  vehicle_id: string;
  driver_name: string;
  place_to_visit: string;
  delivery_date: string;
  return_date: string;
  daily_charge: number | null;
  duration: number | null;
  fuel_range: string;
  start_odometer: number | null;
  end_odometer: number | null;
  total_kilometers: number | null;
  kilometer_rate: number | null;
  booking_amount: number | null;
  caution_money: number | null;
  payment_method: PaymentMethod | null;
  total_amount: number | null;
  notes: string;
};

export type VehicleSelectOption = {
  readonly id: string;
  readonly vehicle_name: string;
  readonly vehicle_number: string;
};

export type CreateBookingFieldErrors = Partial<Record<keyof CreateBookingFormValues, string>>;

/** Staff-facing payment labels (RTGS / IMPS maps to `bank_transfer`). */
export const CREATE_BOOKING_PAYMENT_OPTIONS: SelectOption<PaymentMethod>[] =
  PAYMENT_METHOD_VALUES.map((value) => ({
    value,
    label: value === PAYMENT_METHODS.bankTransfer ? 'RTGS / IMPS' : PAYMENT_METHOD_LABELS[value],
  }));

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createBookingFormDefaults(
  suggestedInvoiceNumber?: string,
): CreateBookingFormValues {
  const today = todayIsoDate();

  return {
    invoice_number: suggestedInvoiceNumber ?? '',
    mode: RENTAL_MODES.withDriver,
    invoice_date: today,
    customer_name: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    document_submitted: false,
    vehicle_id: '',
    driver_name: '',
    place_to_visit: '',
    delivery_date: today,
    return_date: today,
    daily_charge: null,
    duration: 1,
    fuel_range: '',
    start_odometer: null,
    end_odometer: null,
    total_kilometers: null,
    kilometer_rate: null,
    booking_amount: 0,
    caution_money: 0,
    payment_method: null,
    total_amount: 0,
    notes: '',
  };
}

/** Map form values into the create-booking schema input shape. */
export function toCreateBookingInput(values: CreateBookingFormValues) {
  return {
    invoice_number: values.invoice_number,
    mode: values.mode,
    invoice_date: values.invoice_date || undefined,
    customer_name: values.customer_name,
    contact_number: values.contact_number,
    address: values.address,
    city: values.city,
    state: values.state,
    zip_code: values.zip_code,
    document_submitted: values.document_submitted,
    vehicle_id: values.vehicle_id,
    driver_name: values.driver_name,
    place_to_visit: values.place_to_visit,
    delivery_date: values.delivery_date,
    return_date: values.return_date,
    daily_charge: values.daily_charge ?? undefined,
    duration: values.duration,
    fuel_range: values.fuel_range,
    start_odometer: values.start_odometer,
    end_odometer: values.end_odometer,
    total_kilometers: values.total_kilometers,
    kilometer_rate: values.kilometer_rate,
    booking_amount: values.booking_amount ?? 0,
    caution_money: values.caution_money ?? 0,
    payment_method: values.payment_method,
    total_amount: values.total_amount ?? 0,
    notes: values.notes,
    status: 'confirmed' as const,
  };
}

export function validateCreateBookingForm(
  values: CreateBookingFormValues,
):
  | { success: true; data: CreateBookingValues }
  | { success: false; fieldErrors: CreateBookingFieldErrors; formError: string } {
  const parsed = createBookingSchema.safeParse(toCreateBookingInput(values));

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors: CreateBookingFieldErrors = {};

  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in fieldErrors)) {
      fieldErrors[key as keyof CreateBookingFormValues] = issue.message;
    }
  }

  const first = parsed.error.issues[0];

  return {
    success: false,
    fieldErrors,
    formError: first?.message ?? 'Please correct the highlighted fields.',
  };
}

export function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function formatVehicleOptionLabel(vehicle: VehicleSelectOption): string {
  return `${vehicle.vehicle_name} (${vehicle.vehicle_number})`;
}
