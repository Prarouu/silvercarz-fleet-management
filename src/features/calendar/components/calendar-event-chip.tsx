import Link from 'next/link';

import { bookingDetailPath } from '@/constants/routes';
import { CALENDAR_EVENT_VARIANT_CLASSES } from '@/features/calendar/lib/calendar-events';
import type { CalendarEvent } from '@/features/calendar/types';
import { cn } from '@/lib/utils';

type CalendarEventChipProps = {
  readonly event: CalendarEvent;
  readonly compact?: boolean;
  readonly className?: string;
};

export function CalendarEventChip({ event, compact = false, className }: CalendarEventChipProps) {
  const variantClass = CALENDAR_EVENT_VARIANT_CLASSES[event.badgeVariant];

  return (
    <Link
      href={bookingDetailPath(event.bookingId)}
      className={cn(
        'block rounded-md border px-1.5 py-1 text-left transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        variantClass,
        className,
      )}
      aria-label={`${event.vehicleName} · ${event.customerName} · ${event.statusLabel}. Open booking details.`}
    >
      <span className={cn('block truncate font-medium', compact ? 'text-[11px]' : 'text-xs')}>
        {event.vehicleName}
      </span>
      {!compact ? (
        <>
          <span className="block truncate text-[11px] opacity-90">{event.registrationNumber}</span>
          <span className="block truncate text-[11px] opacity-90">{event.customerName}</span>
        </>
      ) : (
        <span className="block truncate text-[10px] opacity-90">{event.customerName}</span>
      )}
    </Link>
  );
}
