import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { bookingDetailPath } from '@/constants/routes';
import { CALENDAR_EVENT_VARIANT_CLASSES } from '@/features/calendar/lib/calendar-events';
import type { CalendarEvent } from '@/features/calendar/types';
import { VehicleThumbnail } from '@/features/vehicles/components/vehicle-thumbnail';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type CalendarMobileAgendaProps = {
  readonly events: readonly CalendarEvent[];
  readonly className?: string;
};

export function CalendarMobileAgenda({ events, className }: CalendarMobileAgendaProps) {
  const sorted = [...events].sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));

  return (
    <section className={cn('space-y-3 md:hidden', className)} aria-label="Calendar agenda">
      <h2 className="text-subheading tracking-tight">Agenda</h2>
      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No bookings in this period.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((event) => (
            <li key={event.id}>
              <Link
                href={bookingDetailPath(event.bookingId)}
                className={cn(
                  'block space-y-2 rounded-xl border p-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  CALENDAR_EVENT_VARIANT_CLASSES[event.badgeVariant],
                )}
                aria-label={`${event.vehicleName}, ${event.customerName}. Open booking details.`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <VehicleThumbnail
                      imagePath={event.vehicleImagePath}
                      alt={`${event.vehicleName} photo`}
                      size="xs"
                      className="border-current/20 bg-background/40"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-medium">{event.vehicleName}</p>
                      <p className="truncate text-xs opacity-90">{event.registrationNumber}</p>
                    </div>
                  </div>
                  <Badge variant={event.badgeVariant}>{event.statusLabel}</Badge>
                </div>
                <p className="text-sm">{event.customerName}</p>
                <p className="text-xs opacity-90">
                  {formatDate(event.deliveryDate)}
                  {event.deliveryDate !== event.returnDate
                    ? ` → ${formatDate(event.returnDate)}`
                    : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
