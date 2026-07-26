/**
 * Thin create-mode wrapper around the shared VehicleForm.
 * Prefer importing `VehicleForm` with `mode="create"` for new call sites.
 */

import { VehicleForm } from '@/features/vehicles/components/vehicle-form';

type CreateVehicleFormProps = {
  readonly className?: string;
};

export function CreateVehicleForm({ className }: CreateVehicleFormProps) {
  return <VehicleForm mode="create" className={className} />;
}
