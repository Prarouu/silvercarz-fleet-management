import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import type { VehicleFormValues } from '@/features/vehicles/lib/vehicle-form';

/** Shared props for VehicleForm field sections. */
export type VehicleFormSectionProps = {
  readonly control: Control<VehicleFormValues>;
  readonly register: UseFormRegister<VehicleFormValues>;
  readonly errors: FieldErrors<VehicleFormValues>;
  readonly isLoading: boolean;
};
