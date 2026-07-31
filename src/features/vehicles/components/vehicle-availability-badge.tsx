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
  available: 'border-success/25 bg-success/10 text-success',
  booked: 'border-warning/25 bg-warning/10 text-warning',
  reserved: 'border-info/25 bg-info/10 text-info',
  maintenance: 'border-primary/30 bg-primary/10 text-foreground',
  inactive: 'border-border bg-muted text-muted-foreground',
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
