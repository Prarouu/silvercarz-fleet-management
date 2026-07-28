/**
 * Shared Booking form defaults, display options, and payload helpers.
 *
 * Used by Create and Edit. Validation rules live in `@/validations` —
 * this module only shapes UX values.
 */

import type {
  Booking,
  PaymentMethod,
  RentalMode,
  SelectOption,
  VehicleAvailabilityStatus,
} from '@/types';
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_VALUES,
  RENTAL_MODES,
  VEHICLE_AVAILABILITY_STATUS_LABELS,
} from '@/types';
import {
  createBookingSchema,
  type CreateBookingValues,
  type UpdateBookingValues,
} from '@/validations';

/** Form field values before Zod parse (empty strings for optional text). */
export type BookingFormValues = {
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

/** @deprecated Prefer `BookingFormValues`. */
export type CreateBookingFormValues = BookingFormValues;

export type VehicleSelectOption = {
  readonly id: string;
  readonly vehicle_name: string;
  readonly vehicle_number: string;
  readonly availability_status?: VehicleAvailabilityStatus;
  readonly is_active?: boolean;
  /** When true, option is shown but not selectable (booked / maintenance / inactive). */
  readonly disabled?: boolean;
};

export type BookingFormFieldErrors = Partial<Record<keyof BookingFormValues, string>>;

/** @deprecated Prefer `BookingFormFieldErrors`. */
export type CreateBookingFieldErrors = BookingFormFieldErrors;

/** Staff-facing payment labels (RTGS / IMPS maps to `bank_transfer`). */
export const BOOKING_PAYMENT_OPTIONS: SelectOption<PaymentMethod>[] = PAYMENT_METHOD_VALUES.map(
  (value) => ({
    value,
    label: value === PAYMENT_METHODS.bankTransfer ? 'RTGS / IMPS' : PAYMENT_METHOD_LABELS[value],
  }),
);

/** @deprecated Prefer `BOOKING_PAYMENT_OPTIONS`. */
export const CREATE_BOOKING_PAYMENT_OPTIONS = BOOKING_PAYMENT_OPTIONS;

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createBookingFormDefaults(suggestedInvoiceNumber?: string): BookingFormValues {
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

/** Map a persisted booking row into editable form values. */
export function bookingToFormValues(booking: Booking): BookingFormValues {
  return {
    invoice_number: booking.invoice_number,
    mode: booking.mode,
    invoice_date: booking.invoice_date,
    customer_name: booking.customer_name,
    contact_number: booking.contact_number ?? '',
    address: booking.address ?? '',
    city: booking.city ?? '',
    state: booking.state ?? '',
    zip_code: booking.zip_code ?? '',
    document_submitted: booking.document_submitted,
    vehicle_id: booking.vehicle_id,
    driver_name: booking.driver_name ?? '',
    place_to_visit: booking.place_to_visit ?? '',
    delivery_date: booking.delivery_date,
    return_date: booking.return_date,
    daily_charge: booking.daily_charge,
    duration: booking.duration,
    fuel_range: booking.fuel_range ?? '',
    start_odometer: booking.start_odometer,
    end_odometer: booking.end_odometer,
    total_kilometers: booking.total_kilometers,
    kilometer_rate: booking.kilometer_rate,
    booking_amount: booking.booking_amount,
    caution_money: booking.caution_money,
    payment_method: booking.payment_method,
    total_amount: booking.total_amount,
    notes: booking.notes ?? '',
  };
}

/** Map form values into the create-booking schema input shape. */
export function toCreateBookingInput(values: BookingFormValues) {
  return {
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
    // Lifecycle status is owned by the Status Service on the server.
  };
}

/** Map form values into the update-booking schema input shape (no manual status). */
export function toUpdateBookingInput(values: BookingFormValues) {
  return toCreateBookingInput(values);
}

function mapZodFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
): BookingFormFieldErrors {
  const fieldErrors: BookingFormFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in fieldErrors)) {
      fieldErrors[key as keyof BookingFormValues] = issue.message;
    }
  }

  return fieldErrors;
}

export function validateCreateBookingForm(
  values: BookingFormValues,
):
  | { success: true; data: CreateBookingValues }
  | { success: false; fieldErrors: BookingFormFieldErrors; formError: string } {
  const parsed = createBookingSchema.safeParse(toCreateBookingInput(values));

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors = mapZodFieldErrors(parsed.error.issues);
  const first = parsed.error.issues[0];

  return {
    success: false,
    fieldErrors,
    formError: first?.message ?? 'Please correct the highlighted fields.',
  };
}

/**
 * Full-form validation for edit (same field rules as create).
 * Uses `createBookingSchema` so partial update schema cannot skip required fields.
 * Status is never accepted from the client — Status Service owns lifecycle.
 */
export function validateUpdateBookingForm(
  values: BookingFormValues,
):
  | { success: true; data: UpdateBookingValues }
  | { success: false; fieldErrors: BookingFormFieldErrors; formError: string } {
  const parsed = createBookingSchema.safeParse(toUpdateBookingInput(values));

  if (parsed.success) {
    const { status: _ignoredStatus, ...data } = parsed.data;
    return { success: true, data };
  }

  const fieldErrors = mapZodFieldErrors(parsed.error.issues);
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
  const base = `${vehicle.vehicle_name} (${vehicle.vehicle_number})`;

  if (!vehicle.availability_status || vehicle.availability_status === 'available') {
    return base;
  }

  return `${base} — ${VEHICLE_AVAILABILITY_STATUS_LABELS[vehicle.availability_status]}`;
}

/** Vehicles that must never be newly selected on a booking form. */
export function isVehicleSelectionBlocked(vehicle: VehicleSelectOption): boolean {
  if (vehicle.disabled) {
    return true;
  }

  if (vehicle.is_active === false) {
    return true;
  }

  return (
    vehicle.availability_status === 'booked' ||
    vehicle.availability_status === 'maintenance' ||
    vehicle.availability_status === 'inactive'
  );
}
