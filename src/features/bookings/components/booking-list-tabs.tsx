'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import {
  BOOKING_LIST_VIEWS,
  buildBookingListSearchParams,
  type BookingListUrlState,
  type BookingListView,
} from '@/features/bookings/lib/booking-list-params';
import { cn } from '@/lib/utils';

type BookingListTabsProps = {
  readonly state: BookingListUrlState;
  readonly pendingCount: number | null;
  readonly confirmedCount: number | null;
};

const TABS: readonly {
  readonly view: BookingListView;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    view: BOOKING_LIST_VIEWS.pending,
    label: 'Pending approval',
    description: 'Customer booking requests awaiting review',
  },
  {
    view: BOOKING_LIST_VIEWS.confirmed,
    label: 'Confirmed',
    description: 'Approved and active fleet bookings',
  },
] as const;

export function BookingListTabs({ state, pendingCount, confirmedCount }: BookingListTabsProps) {
  const pathname = usePathname();

  function hrefFor(view: BookingListView): string {
    // Keep search/mode when switching; reset page + status for the new queue.
    const query = buildBookingListSearchParams(state, {
      view,
      page: 1,
      status: view === BOOKING_LIST_VIEWS.pending ? 'draft' : '',
    });
    return query ? `${pathname}?${query}` : pathname;
  }

  function countFor(view: BookingListView): number | null {
    return view === BOOKING_LIST_VIEWS.pending ? pendingCount : confirmedCount;
  }

  return (
    <div className="space-y-2">
      <div
        role="tablist"
        aria-label="Booking queues"
        className="flex flex-col gap-2 rounded-3xl border bg-card p-1.5 sm:flex-row sm:items-stretch"
      >
        {TABS.map((tab) => {
          const active = state.view === tab.view;
          const count = countFor(tab.view);

          return (
            <Link
              key={tab.view}
              href={hrefFor(tab.view)}
              role="tab"
              aria-selected={active}
              className={cn(
                'flex min-h-14 flex-1 flex-col justify-center rounded-2xl px-4 py-3 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wide">{tab.label}</span>
                {count != null ? (
                  <Badge
                    variant={active ? 'secondary' : 'outline'}
                    className={cn(
                      'tabular-nums',
                      active &&
                        'border-transparent bg-primary-foreground/15 text-primary-foreground',
                    )}
                  >
                    {count}
                  </Badge>
                ) : null}
              </span>
              <span
                className={cn(
                  'mt-0.5 text-xs',
                  active ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {tab.description}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
