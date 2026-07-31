import Link from 'next/link';

import { bookingDetailPath } from '@/constants/routes';
import { CALENDAR_EVENT_VARIANT_CLASSES } from '@/features/calendar/lib/calendar-events';
import { enumerateDates } from '@/features/calendar/lib/calendar-range';
import type { FleetTimelineRow } from '@/features/calendar/types';
import { VehicleAvailabilityBadge } from '@/features/vehicles/components/vehicle-availability-badge';
import { VehicleThumbnail } from '@/features/vehicles/components/vehicle-thumbnail';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Minimum width per day column — keeps month ranges readable via horizontal scroll. */
const DAY_COLUMN_MIN_PX = 52;

type FleetTimelineProps = {
  readonly rows: readonly FleetTimelineRow[];
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly className?: string;
};

export function FleetTimeline({ rows, rangeStart, rangeEnd, className }: FleetTimelineProps) {
  const days = enumerateDates(rangeStart, rangeEnd);
  const dayCount = Math.max(days.length, 1);
  const trackMinWidthPx = dayCount * DAY_COLUMN_MIN_PX;
  const trackGridStyle = {
    gridTemplateColumns: `repeat(${dayCount}, minmax(${DAY_COLUMN_MIN_PX}px, 1fr))`,
    minWidth: trackMinWidthPx,
  } as const;

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
        <div className="rounded-3xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No vehicles match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain rounded-3xl border bg-card p-3">
          <p className="mb-2 text-xs text-muted-foreground md:hidden">
            Scroll horizontally to browse days →
          </p>

          <div className="w-max min-w-full space-y-3">
            <div className="flex gap-2 sm:gap-3">
              {/* Sticky marker column — image-sized so timeline stays readable while scrolling */}
              <div
                className="sticky left-0 z-20 w-11 shrink-0 border-r border-border/50 bg-card"
                aria-hidden="true"
              />
              <div className="w-36 shrink-0 px-1 text-xs font-medium text-muted-foreground sm:w-44">
                Vehicle
              </div>
              <div className="grid min-w-0 flex-1" style={trackGridStyle}>
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

            {rows.map((row) => {
              const vehicleLabel = `${row.vehicleName} · ${row.registrationNumber}`;

              return (
                <div key={row.vehicleId} className="flex gap-2 sm:gap-3">
                  <div
                    className="sticky left-0 z-20 flex w-11 shrink-0 items-center justify-center border-r border-border/50 bg-card"
                    title={vehicleLabel}
                  >
                    <VehicleThumbnail
                      imagePath={row.vehicleImagePath}
                      alt={`${row.vehicleName} photo`}
                      size="xs"
                    />
                  </div>

                  <div className="flex w-36 shrink-0 flex-col justify-center gap-1 rounded-md bg-muted/30 px-2 py-2 sm:w-44">
                    <p className="truncate text-sm font-medium">{row.vehicleName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.registrationNumber}
                    </p>
                    <VehicleAvailabilityBadge availability={row.availabilityStatus} />
                  </div>

                  <div
                    className="relative min-h-12 min-w-0 flex-1 rounded-md bg-muted/20"
                    style={{ minWidth: trackMinWidthPx }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 grid"
                      style={trackGridStyle}
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
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
