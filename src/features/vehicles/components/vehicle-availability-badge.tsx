import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleAvailabilityStatus } from '@/types';
import { VEHICLE_AVAILABILITY_STATUS_LABELS } from '@/types';

/**
 * Fleet availability states.
 *
 * Persisted on `vehicles.availability_status`. Inactive vehicles hide
 * availability in the list (status badge covers retirement).
 */
export type VehicleAvailability = VehicleAvailabilityStatus;

export const VEHICLE_AVAILABILITY_LABELS = VEHICLE_AVAILABILITY_STATUS_LABELS;

const AVAILABILITY_CLASS: Record<VehicleAvailability, string> = {
  available: 'border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  booked: 'border-amber-500/25 bg-amber-500/15 text-amber-800 dark:text-amber-300',
  maintenance: 'border-sky-500/25 bg-sky-500/15 text-sky-800 dark:text-sky-300',
};

/** Resolves display availability from the current vehicle row model. */
export function resolveVehicleAvailability(
  vehicle: Pick<Vehicle, 'is_active' | 'availability_status'> | boolean,
): VehicleAvailability | null {
  // Backward-compatible overload used by older call sites (is_active only).
  if (typeof vehicle === 'boolean') {
    return vehicle ? 'available' : null;
  }

  if (!vehicle.is_active) {
    return null;
  }

  return vehicle.availability_status;
}

export function VehicleAvailabilityBadge({
  availability,
  className,
}: {
  availability: VehicleAvailability;
  className?: string;
}) {
  const label = VEHICLE_AVAILABILITY_LABELS[availability];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium tracking-wide', AVAILABILITY_CLASS[availability], className)}
      aria-label={`Availability: ${label}`}
    >
      {label}
    </Badge>
  );
}
