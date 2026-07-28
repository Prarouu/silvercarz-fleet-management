import { ArrowLeft, Ban, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES, vehicleEditPath } from '@/constants/routes';
import { VehicleDetailSection } from '@/features/vehicles/components/vehicle-detail-section';

type VehicleDetailQuickActionsProps = {
  readonly vehicleId: string;
};

/** Bottom quick-action strip for common fleet profile workflows. */
export function VehicleDetailQuickActions({ vehicleId }: VehicleDetailQuickActionsProps) {
  return (
    <VehicleDetailSection title="Quick Actions" description="Common next steps for this vehicle.">
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        role="toolbar"
        aria-label="Vehicle quick actions"
      >
        <Button asChild size="sm" className="justify-start">
          <Link href={vehicleEditPath(vehicleId)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit Vehicle
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href={ROUTES.bookingsNew}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            Create Booking
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href={ROUTES.vehicles}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Fleet
          </Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          disabled
          aria-disabled="true"
          title="Deactivate vehicle will be available in a future release"
        >
          <Ban className="size-4" aria-hidden="true" />
          Deactivate Vehicle
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start text-destructive"
          disabled
          aria-disabled="true"
          title="Delete vehicle will be available in a future release"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete Vehicle
        </Button>
      </div>
    </VehicleDetailSection>
  );
}
