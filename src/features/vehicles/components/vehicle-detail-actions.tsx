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
      <Button asChild size="sm">
        <Link href={vehicleEditPath(vehicleId)}>
          <Pencil className="size-4" aria-hidden="true" />
          <span className="sm:hidden">Edit</span>
          <span className="hidden sm:inline">Edit Vehicle</span>
        </Link>
      </Button>

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.vehicles}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Fleet</span>
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        aria-disabled="true"
        title="Deactivate vehicle will be available in a future release"
      >
        <Ban className="size-4" aria-hidden="true" />
        <span className="sm:hidden">Deactivate</span>
        <span className="hidden sm:inline">Deactivate Vehicle</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive"
        disabled
        aria-disabled="true"
        title="Delete vehicle will be available in a future release"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        <span className="sm:hidden">Delete</span>
        <span className="hidden sm:inline">Delete Vehicle</span>
      </Button>
    </div>
  );
}
