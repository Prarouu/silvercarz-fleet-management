import Link from 'next/link';

import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { VehicleBreadcrumb } from '@/features/vehicles/components/vehicle-breadcrumb';
import { VehicleForm } from '@/features/vehicles/components/vehicle-form';
import { vehicleToFormValues } from '@/features/vehicles/lib/vehicle-form';
import type { Vehicle } from '@/types';

type EditVehiclePageProps = {
  readonly vehicle?: Vehicle;
  readonly loadError?: string;
};

export function EditVehiclePage({ vehicle, loadError }: EditVehiclePageProps) {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4">
        <VehicleBreadcrumb current="Edit" middle="Vehicle" />
        <PageHeader title="Edit Vehicle" description="Update fleet information." />
      </div>

      {loadError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Vehicle unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={ROUTES.vehicles}>Back to Fleet</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {vehicle && !loadError ? (
        <VehicleForm
          mode="edit"
          vehicleId={vehicle.id}
          defaultValues={vehicleToFormValues(vehicle)}
          existingImagePath={vehicle.image_path}
        />
      ) : null}
    </PageContainer>
  );
}
