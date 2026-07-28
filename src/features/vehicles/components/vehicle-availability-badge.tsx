import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleAvailabilityStatus } from '@/types';
import { VEHICLE_AVAILABILITY_STATUS_LABELS } from '@/types';

/**
 * Fleet availability states.
 *
 * Persisted on `vehicles.availability_status` (independent of Active/Inactive roster,
 * except `inactive` which aligns with soft-retire).
 */
export type VehicleAvailability = VehicleAvailabilityStatus;

export const VEHICLE_AVAILABILITY_LABELS = VEHICLE_AVAILABILITY_STATUS_LABELS;

const AVAILABILITY_CLASS: Record<VehicleAvailability, string> = {
  available: 'border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  booked: 'border-amber-500/25 bg-amber-500/15 text-amber-800 dark:text-amber-300',
  reserved: 'border-violet-500/25 bg-violet-500/15 text-violet-800 dark:text-violet-300',
  maintenance: 'border-sky-500/25 bg-sky-500/15 text-sky-800 dark:text-sky-300',
  inactive: 'border-zinc-500/25 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
};

/** Resolves display availability from the current vehicle row model. */
export function resolveVehicleAvailability(
  vehicle: Pick<Vehicle, 'is_active' | 'availability_status'> | boolean,
): VehicleAvailability | null {
  // Backward-compatible overload used by older call sites (is_active only).
  if (typeof vehicle === 'boolean') {
    return vehicle ? 'available' : 'inactive';
  }

  if (!vehicle.is_active) {
    return 'inactive';
  }

  return vehicle.availability_status ?? null;
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
      className={cn(
        'max-w-full truncate font-medium tracking-wide whitespace-nowrap',
        AVAILABILITY_CLASS[availability],
        className,
      )}
      aria-label={`Availability: ${label}`}
    >
      {label}
    </Badge>
  );
}
