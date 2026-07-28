'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  buildCalendarSearchParams,
  type CalendarUrlState,
} from '@/features/calendar/lib/calendar-params';
import { shiftAnchorDate, todayIsoDate } from '@/features/calendar/lib/calendar-range';
import { CALENDAR_VIEW_OPTIONS, type CalendarViewImplemented } from '@/features/calendar/types';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type CalendarToolbarProps = {
  readonly state: CalendarUrlState;
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly className?: string;
};

export function CalendarToolbar({ state, rangeStart, rangeEnd, className }: CalendarToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(updates: Partial<CalendarUrlState>) {
    const query = buildCalendarSearchParams(state, updates);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  const rangeLabel =
    rangeStart === rangeEnd
      ? formatDate(rangeStart)
      : `${formatDate(rangeStart)} – ${formatDate(rangeEnd)}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
        isPending && 'opacity-80',
        className,
      )}
      aria-busy={isPending}
    >
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Calendar period">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => navigate({ date: shiftAnchorDate(state.view, state.date, -1) })}
          aria-label="Previous period"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate({ date: todayIsoDate() })}
        >
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => navigate({ date: shiftAnchorDate(state.view, state.date, 1) })}
          aria-label="Next period"
        >
          <ChevronRight className="size-4" />
        </Button>
        <p className="px-1 text-sm font-medium tracking-tight tabular-nums">{rangeLabel}</p>
      </div>

      <div
        className="flex flex-wrap gap-1 rounded-lg bg-muted/50 p-1"
        role="tablist"
        aria-label="Calendar view"
      >
        {CALENDAR_VIEW_OPTIONS.map((option) => {
          const selected = state.view === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              variant={selected ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(selected && 'shadow-none')}
              onClick={() => navigate({ view: option.value as CalendarViewImplemented })}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
