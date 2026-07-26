import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { CreateVehicleForm } from '@/features/vehicles/components/create-vehicle-form';
import { VehicleBreadcrumb } from '@/features/vehicles/components/vehicle-breadcrumb';

export function CreateVehiclePage() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4">
        <VehicleBreadcrumb current="Add Vehicle" />
        <PageHeader
          title="Add Vehicle"
          description="Register a new vehicle into the Silver Carz fleet."
        />
      </div>

      <CreateVehicleForm />
    </PageContainer>
  );
}
