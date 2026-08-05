'use client';

import { CalendarRange, RotateCw, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BOOKING_LIST_VIEWS,
  buildBookingListSearchParams,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import {
  BOOKING_DISPLAY_STATUS_LABELS,
  BOOKING_DISPLAY_STATUSES,
} from '@/features/bookings/service/status.service';
import { useDebounce } from '@/hooks';
import { RENTAL_MODE_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

const CONFIRMED_STATUS_OPTIONS = [
  BOOKING_DISPLAY_STATUSES.upcoming,
  BOOKING_DISPLAY_STATUSES.active,
  BOOKING_DISPLAY_STATUSES.completed,
  BOOKING_DISPLAY_STATUSES.cancelled,
] as const;

type BookingListToolbarProps = {
  readonly state: BookingListUrlState;
  readonly className?: string;
};

export function BookingListToolbar({ state, className }: BookingListToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(state.search);
  const [prevUrlSearch, setPrevUrlSearch] = useState(state.search);
  const debouncedSearch = useDebounce(searchInput, 350);
  const isPendingView = state.view === BOOKING_LIST_VIEWS.pending;

  if (state.search !== prevUrlSearch) {
    setPrevUrlSearch(state.search);
    setSearchInput(state.search);
  }

  function navigate(updates: Partial<BookingListUrlState>) {
    const query = buildBookingListSearchParams(state, updates);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  const pushDebouncedSearch = useEffectEvent((value: string) => {
    if (value === state.search) {
      return;
    }
    navigate({ search: value, page: 1 });
  });

  useEffect(() => {
    pushDebouncedSearch(debouncedSearch);
  }, [debouncedSearch]);

  const hasFilters = Boolean(
    state.search || state.mode || (state.view === BOOKING_LIST_VIEWS.confirmed && state.status),
  );

  return (
    <div
      className={cn('rounded-3xl border bg-card p-3 sm:p-4', isPending && 'opacity-80', className)}
      aria-busy={isPending}
      role="search"
      aria-label="Filter bookings"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div
          className={cn(
            'grid flex-1 gap-3 sm:grid-cols-2',
            isPendingView ? 'xl:grid-cols-3' : 'xl:grid-cols-4',
          )}
        >
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label htmlFor="booking-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="booking-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Invoice, customer, contact, vehicle…"
                className={cn('pl-8', searchInput && 'pr-10 sm:pr-8')}
                autoComplete="off"
                enterKeyHint="search"
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
                  onClick={() => {
                    setSearchInput('');
                    setPrevUrlSearch('');
                    navigate({ search: '', page: 1 });
                  }}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>

          {!isPendingView ? (
            <div className="space-y-1.5">
              <Label htmlFor="booking-status-filter">Status</Label>
              <Select
                value={state.status || ALL_VALUE}
                onValueChange={(value) =>
                  navigate({
                    status: value === ALL_VALUE ? '' : (value ?? ''),
                    page: 1,
                  })
                }
              >
                <SelectTrigger id="booking-status-filter" className="w-full" size="default">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                  {CONFIRMED_STATUS_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {BOOKING_DISPLAY_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="booking-mode-filter">Rental mode</Label>
            <Select
              value={state.mode || ALL_VALUE}
              onValueChange={(value) =>
                navigate({
                  mode: value === ALL_VALUE ? '' : (value ?? ''),
                  page: 1,
                })
              }
            >
              <SelectTrigger id="booking-mode-filter" className="w-full" size="default">
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All modes</SelectItem>
                {RENTAL_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden space-y-1.5 sm:block">
            <Label htmlFor="booking-date-range">Date range</Label>
            <Button
              id="booking-date-range"
              type="button"
              variant="outline"
              className="w-full justify-start font-normal text-muted-foreground"
              disabled
              aria-disabled="true"
              title="Date range filtering will be available in a later update"
            >
              <CalendarRange className="size-4" />
              Date range
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
            aria-label="Refresh bookings"
          >
            <RotateCw className={cn('size-4', isPending && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 sm:flex-initial"
            disabled={!hasFilters}
            onClick={() => {
              setSearchInput('');
              setPrevUrlSearch('');
              const query = buildBookingListSearchParams(state, {
                search: '',
                status: state.view === BOOKING_LIST_VIEWS.pending ? 'draft' : '',
                mode: '',
                page: 1,
              });
              startTransition(() => {
                router.push(query ? `${pathname}?${query}` : pathname);
              });
            }}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  );
}
