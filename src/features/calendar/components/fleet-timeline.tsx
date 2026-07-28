import Link from 'next/link';

import { bookingDetailPath } from '@/constants/routes';
import { CALENDAR_EVENT_VARIANT_CLASSES } from '@/features/calendar/lib/calendar-events';
import { enumerateDates } from '@/features/calendar/lib/calendar-range';
import type { FleetTimelineRow } from '@/features/calendar/types';
import { VehicleAvailabilityBadge } from '@/features/vehicles/components/vehicle-availability-badge';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type FleetTimelineProps = {
  readonly rows: readonly FleetTimelineRow[];
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly className?: string;
};

export function FleetTimeline({ rows, rangeStart, rangeEnd, className }: FleetTimelineProps) {
  const days = enumerateDates(rangeStart, rangeEnd);
  const dayCount = Math.max(days.length, 1);

  return (
    <section className={cn('space-y-3', className)} aria-label="Fleet timeline">
      <div className="space-y-1">
        <h2 className="text-subheading tracking-tight">Fleet Timeline</h2>
        <p className="text-body text-muted-foreground">
          Vehicle occupancy across {formatDate(rangeStart)}
          {rangeStart !== rangeEnd ? ` – ${formatDate(rangeEnd)}` : ''}. Availability is resolved by
          the Availability Engine.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No vehicles match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card p-3">
          <div className="min-w-[36rem] space-y-3">
            <div className="flex gap-3">
              <div className="w-44 shrink-0 px-1 text-xs font-medium text-muted-foreground">
                Vehicle
              </div>
              <div
                className="grid min-w-0 flex-1"
                style={{ gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))` }}
              >
                {days.map((day) => (
                  <div
                    key={day}
                    className="px-0.5 text-center text-[10px] font-medium text-muted-foreground tabular-nums"
                  >
                    {formatDate(day, 'dd')}
                  </div>
                ))}
              </div>
            </div>

            {rows.map((row) => (
              <div key={row.vehicleId} className="flex gap-3">
                <div className="flex w-44 shrink-0 flex-col justify-center gap-1 rounded-md bg-muted/30 px-2 py-2">
                  <p className="truncate text-sm font-medium">{row.vehicleName}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.registrationNumber}</p>
                  <VehicleAvailabilityBadge availability={row.availabilityStatus} />
                </div>

                <div className="relative min-h-12 min-w-0 flex-1 rounded-md bg-muted/20">
                  <div
                    className="pointer-events-none absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))` }}
                    aria-hidden="true"
                  >
                    {days.map((day) => (
                      <div
                        key={`${row.vehicleId}-guide-${day}`}
                        className="border-l border-border/40 first:border-l-0"
                      />
                    ))}
                  </div>

                  {row.blocks.map((block) => {
                    const startIndex = days.indexOf(block.startDate);
                    const endIndex = days.indexOf(block.endDate);
                    if (startIndex < 0 || endIndex < 0) {
                      return null;
                    }
                    const span = endIndex - startIndex + 1;
                    const variantClass = CALENDAR_EVENT_VARIANT_CLASSES[block.badgeVariant];

                    return (
                      <Link
                        key={block.bookingId}
                        href={bookingDetailPath(block.bookingId)}
                        className={cn(
                          'absolute top-1.5 bottom-1.5 flex items-center overflow-hidden rounded-md border px-1.5 text-[10px] font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                          variantClass,
                        )}
                        style={{
                          left: `calc(${(startIndex / dayCount) * 100}% + 2px)`,
                          width: `calc(${(span / dayCount) * 100}% - 4px)`,
                        }}
                        aria-label={`${row.vehicleName} occupied by ${block.customerName}, ${block.statusLabel}. Open booking.`}
                        title={`${block.invoiceNumber} · ${block.customerName}`}
                      >
                        <span className="truncate">
                          {'■'.repeat(Math.min(span, 8))} {block.customerName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
