import { notFound } from 'next/navigation';

import { getVehicle } from '@/features/vehicles/actions/get-vehicle';
import { EditVehiclePage } from '@/features/vehicles/components/edit-vehicle-page';
import { VEHICLE_ERROR_CODES } from '@/features/vehicles/errors';

type EditVehicleRouteProps = {
  readonly params: Promise<{ id: string }>;
};

export default async function EditVehicleRoute({ params }: EditVehicleRouteProps) {
  const { id } = await params;
  const response = await getVehicle(id);

  if (!response.success) {
    if (response.error.code === VEHICLE_ERROR_CODES.notFound) {
      notFound();
    }

    return <EditVehiclePage loadError={response.error.message || 'Unable to load this vehicle.'} />;
  }

  return <EditVehiclePage vehicle={response.data} />;
}
