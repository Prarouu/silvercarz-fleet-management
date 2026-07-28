import { format, parseISO } from 'date-fns';

import { CalendarEventChip } from '@/features/calendar/components/calendar-event-chip';
import { enumerateDates } from '@/features/calendar/lib/calendar-range';
import type { CalendarEvent, CalendarViewImplemented } from '@/features/calendar/types';
import { cn } from '@/lib/utils';

type CalendarGridProps = {
  readonly view: CalendarViewImplemented;
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly events: readonly CalendarEvent[];
  readonly asOfDate: string;
  readonly className?: string;
};

function eventsForDay(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((event) => event.deliveryDate <= day && event.returnDate >= day);
}

function dayHeading(day: string, view: CalendarViewImplemented): string {
  const date = parseISO(day);
  if (view === 'month') {
    return format(date, 'd');
  }
  if (view === 'day') {
    return format(date, 'EEEE, d MMM');
  }
  return format(date, 'EEE d');
}

export function CalendarGrid({
  view,
  rangeStart,
  rangeEnd,
  events,
  asOfDate,
  className,
}: CalendarGridProps) {
  const days = enumerateDates(rangeStart, rangeEnd);
  const compact = view === 'month';

  return (
    <section
      className={cn('hidden overflow-hidden rounded-xl border bg-card md:block', className)}
      aria-label={`${view} calendar`}
    >
      <div
        className={cn(
          'grid border-b bg-muted/40',
          view === 'day' && 'grid-cols-1',
          view === 'week' && 'grid-cols-7',
          view === 'month' && 'grid-cols-7',
        )}
      >
        {view === 'month'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
              <div
                key={label}
                className="border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
              >
                {label}
              </div>
            ))
          : days.map((day) => (
              <div
                key={`head-${day}`}
                className={cn(
                  'border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0',
                  day === asOfDate && 'bg-primary/5 text-foreground',
                )}
              >
                {dayHeading(day, view)}
              </div>
            ))}
      </div>

      <div
        className={cn(
          'grid',
          view === 'day' && 'grid-cols-1',
          view === 'week' && 'grid-cols-7',
          view === 'month' && 'grid-cols-7',
        )}
      >
        {view === 'month' ? <MonthCells days={days} events={events} asOfDate={asOfDate} /> : null}

        {view !== 'month'
          ? days.map((day) => {
              const dayEvents = eventsForDay(events, day);
              return (
                <div
                  key={day}
                  className={cn(
                    'min-h-36 space-y-1.5 border-r border-b p-2 last:border-r-0',
                    day === asOfDate && 'bg-primary/[0.03]',
                  )}
                  aria-label={`${format(parseISO(day), 'EEEE d MMMM')}, ${dayEvents.length} bookings`}
                >
                  {view === 'day' ? null : (
                    <p className="text-xs font-medium text-muted-foreground tabular-nums md:hidden">
                      {dayHeading(day, view)}
                    </p>
                  )}
                  {dayEvents.length === 0 ? (
                    <p className="px-0.5 text-xs text-muted-foreground">No bookings</p>
                  ) : (
                    dayEvents.map((event) => (
                      <CalendarEventChip
                        key={`${day}-${event.id}`}
                        event={event}
                        compact={compact}
                      />
                    ))
                  )}
                </div>
              );
            })
          : null}
      </div>
    </section>
  );
}

function MonthCells({
  days,
  events,
  asOfDate,
}: {
  readonly days: readonly string[];
  readonly events: readonly CalendarEvent[];
  readonly asOfDate: string;
}) {
  const first = parseISO(days[0] ?? asOfDate);
  // Monday-based leading pads
  const pad = (first.getDay() + 6) % 7;
  const cells: Array<string | null> = [...Array.from({ length: pad }, () => null), ...days];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <>
      {cells.map((day, index) => {
        if (!day) {
          return (
            <div
              key={`pad-${index}`}
              className="min-h-28 border-r border-b bg-muted/20 last:border-r-0"
            />
          );
        }

        const dayEvents = eventsForDay(events, day);
        const visible = dayEvents.slice(0, 3);
        const overflow = dayEvents.length - visible.length;

        return (
          <div
            key={day}
            className={cn(
              'min-h-28 space-y-1 border-r border-b p-1.5 last:border-r-0',
              day === asOfDate && 'bg-primary/[0.03]',
            )}
            aria-label={`${format(parseISO(day), 'EEEE d MMMM')}, ${dayEvents.length} bookings`}
          >
            <p
              className={cn(
                'px-0.5 text-xs font-medium tabular-nums',
                day === asOfDate ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {format(parseISO(day), 'd')}
            </p>
            {visible.map((event) => (
              <CalendarEventChip key={`${day}-${event.id}`} event={event} compact />
            ))}
            {overflow > 0 ? (
              <p className="px-0.5 text-[10px] text-muted-foreground">+{overflow} more</p>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
