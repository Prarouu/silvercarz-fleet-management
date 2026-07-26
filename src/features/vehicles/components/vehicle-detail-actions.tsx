import { ArrowLeft, Ban, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES, vehicleEditPath } from '@/constants/routes';

type VehicleDetailActionsProps = {
  readonly vehicleId: string;
};

/**
 * Detail workspace action bar.
 * Edit and Back are functional; Deactivate and Delete remain placeholders.
 */
export function VehicleDetailActions({ vehicleId }: VehicleDetailActionsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
      role="toolbar"
      aria-label="Vehicle actions"
    >
      <Button asChild size="sm" className="min-h-9 sm:min-h-8">
        <Link href={vehicleEditPath(vehicleId)}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit Vehicle
        </Link>
      </Button>

      <Button asChild variant="outline" size="sm" className="min-h-9 sm:min-h-8">
        <Link href={ROUTES.vehicles}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Fleet
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-9 sm:min-h-8"
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
        className="min-h-9 text-destructive sm:min-h-8"
        disabled
        aria-disabled="true"
        title="Delete vehicle will be available in a future release"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Delete Vehicle
      </Button>
    </div>
  );
}
