import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Fleet availability states.
 *
 * Today active vehicles resolve to `available`. `booked` and `maintenance`
 * are reserved for booking-conflict and workshop workflows.
 */
export type VehicleAvailability = 'available' | 'booked' | 'maintenance';

export const VEHICLE_AVAILABILITY_LABELS: Record<VehicleAvailability, string> = {
  available: 'Available',
  booked: 'Booked',
  maintenance: 'Maintenance',
};

const AVAILABILITY_CLASS: Record<VehicleAvailability, string> = {
  available: 'border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  booked: 'border-amber-500/25 bg-amber-500/15 text-amber-800 dark:text-amber-300',
  maintenance: 'border-sky-500/25 bg-sky-500/15 text-sky-800 dark:text-sky-300',
};

/** Resolves display availability from the current vehicle row model. */
export function resolveVehicleAvailability(isActive: boolean): VehicleAvailability | null {
  if (!isActive) {
    return null;
  }

  // Future: inspect booking conflicts / maintenance flags.
  return 'available';
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
