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
  buildBookingListSearchParams,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import { useDebounce } from '@/hooks';
import { BOOKING_STATUS_OPTIONS, RENTAL_MODE_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

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

  const hasFilters = Boolean(state.search || state.status || state.mode);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4',
        isPending && 'opacity-80',
        className,
      )}
      aria-busy={isPending}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                className="pl-8"
                autoComplete="off"
              />
            </div>
          </div>

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
                {BOOKING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-1.5">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
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
            disabled={!hasFilters}
            onClick={() => {
              setSearchInput('');
              setPrevUrlSearch('');
              startTransition(() => {
                router.push(pathname);
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
