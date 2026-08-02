'use client';

import { Fuel, Gauge } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  resolveVehicleAvailability,
  VehicleAvailabilityBadge,
} from '@/features/vehicles/components/vehicle-availability-badge';
import { VehicleThumbnail } from '@/features/vehicles/components/vehicle-thumbnail';
import {
  buildCustomerBookACarSearchParams,
  type CustomerBookACarUrlState,
} from '@/features/vehicles/lib/public-vehicle-list-params';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PublicVehicle } from '@/types';
import { FUEL_TYPE_LABELS, TRANSMISSION_TYPE_LABELS } from '@/types/enums';

export function VehicleBrowseCard({
  vehicle,
  state,
  selected,
}: {
  vehicle: PublicVehicle;
  state: CustomerBookACarUrlState;
  selected: boolean;
}) {
  const availability = resolveVehicleAvailability(vehicle);
  const href = buildCustomerBookACarSearchParams(state, {
    vehicleId: selected ? null : vehicle.id,
  });
  const rate = formatCurrency(Number(vehicle.default_daily_rate), {
    maximumFractionDigits: 0,
  });

  return (
    <article
      className={cn(
        'relative flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors sm:flex-row sm:items-center',
        selected
          ? 'border-primary ring-2 ring-primary/25'
          : 'border-border hover:border-foreground/20',
      )}
    >
      {selected ? (
        <span className="absolute top-3 left-3 z-10 rounded bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
          Selected
        </span>
      ) : null}

      <VehicleThumbnail
        imagePath={vehicle.image_path}
        alt={vehicle.vehicle_name}
        className="h-28 w-full rounded-md sm:h-24 sm:w-36"
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {vehicle.vehicle_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {vehicle.brand}
              {vehicle.color ? ` · ${vehicle.color}` : ''}
            </p>
          </div>
          {availability ? <VehicleAvailabilityBadge availability={availability} /> : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="size-3.5" aria-hidden="true" />
            {FUEL_TYPE_LABELS[vehicle.fuel_type]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" aria-hidden="true" />
            {TRANSMISSION_TYPE_LABELS[vehicle.transmission_type]}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
        <p className="text-sm text-muted-foreground">
          From <span className="text-base font-bold text-foreground">{rate || '—'}</span>
          <span className="text-muted-foreground"> /day</span>
        </p>
        <Button
          asChild
          variant={selected ? 'default' : 'outline'}
          className={cn(
            'h-10 min-w-[6.5rem] rounded-md font-semibold',
            selected && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
          )}
        >
          <Link href={href} scroll={false}>
            {selected ? 'Selected' : 'Select'}
          </Link>
        </Button>
      </div>
    </article>
  );
}
