/**
 * Add Vehicle form defaults, field helpers, and payload mapping.
 *
 * Validation rules live in `@/validations` — this module only shapes UX values.
 */

import type { FuelType, VehicleAvailabilityStatus } from '@/types';
import { VEHICLE_AVAILABILITY_STATUSES } from '@/types';
import { createVehicleSchema, type CreateVehicleValues } from '@/validations';

export type VehicleStatusValue = 'active' | 'inactive';

/** Form field values before Zod parse (empty strings for optional text). */
export type VehicleFormValues = {
  vehicle_name: string;
  vehicle_number: string;
  brand: string;
  model: string;
  variant: string;
  model_year: number | null;
  color: string;
  fuel_type: FuelType | '';
  default_daily_rate: number | null;
  extra_kilometer_rate: number | null;
  security_deposit: number | null;
  current_odometer: number | null;
  availability_status: VehicleAvailabilityStatus;
  /** UI string — mapped to `is_active` boolean for the API/DB. */
  vehicle_status: VehicleStatusValue;
};

export type VehicleFormFieldErrors = Partial<Record<keyof VehicleFormValues, string>>;

export const VEHICLE_STATUS_OPTIONS: ReadonlyArray<{
  readonly value: VehicleStatusValue;
  readonly label: string;
}> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function createVehicleFormDefaults(): VehicleFormValues {
  return {
    vehicle_name: '',
    vehicle_number: '',
    brand: '',
    model: '',
    variant: '',
    model_year: null,
    color: '',
    fuel_type: '',
    default_daily_rate: null,
    extra_kilometer_rate: null,
    security_deposit: null,
    current_odometer: 0,
    availability_status: VEHICLE_AVAILABILITY_STATUSES.available,
    vehicle_status: 'active',
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

function mapZodFieldErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): VehicleFormFieldErrors {
  const fieldErrors: VehicleFormFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key !== 'string') {
      continue;
    }

    if (key === 'is_active') {
      if (!fieldErrors.vehicle_status) {
        fieldErrors.vehicle_status = issue.message;
      }
      continue;
    }

    if (!(key in fieldErrors)) {
      fieldErrors[key as keyof VehicleFormValues] = issue.message;
    }
  }

  return fieldErrors;
}

export function toCreateVehicleInput(values: VehicleFormValues): unknown {
  return {
    vehicle_name: values.vehicle_name,
    vehicle_number: values.vehicle_number,
    brand: values.brand,
    model: values.model,
    variant: values.variant,
    model_year: values.model_year,
    color: values.color,
    fuel_type: values.fuel_type || undefined,
    default_daily_rate: values.default_daily_rate,
    extra_kilometer_rate: values.extra_kilometer_rate,
    security_deposit: values.security_deposit,
    current_odometer: values.current_odometer,
    availability_status: values.availability_status,
    image_path: null,
    is_active: values.vehicle_status === 'active',
  };
}

export function validateCreateVehicleForm(
  values: VehicleFormValues,
):
  | { success: true; data: CreateVehicleValues }
  | { success: false; fieldErrors: VehicleFormFieldErrors; formError: string } {
  const parsed = createVehicleSchema.safeParse(toCreateVehicleInput(values));

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

/** Normalize registration as the user types (uppercase, collapse spaces). */
export function normalizeRegistrationInput(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, '');
}
