'use client';

import { RotateCw, Search, X } from 'lucide-react';
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
import { BOOKING_DISPLAY_STATUS_LABELS } from '@/features/bookings/service/status.service';
import {
  buildCalendarSearchParams,
  CALENDAR_STATUS_FILTER_OPTIONS,
  hasActiveCalendarFilters,
  type CalendarUrlState,
} from '@/features/calendar/lib/calendar-params';
import type { CalendarVehicleOption } from '@/features/calendar/types';
import { useDebounce } from '@/hooks';
import {
  FUEL_TYPE_LABELS,
  FUEL_TYPE_VALUES,
  VEHICLE_AVAILABILITY_STATUS_LABELS,
  VEHICLE_AVAILABILITY_STATUS_VALUES,
} from '@/types';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

type CalendarFiltersProps = {
  readonly state: CalendarUrlState;
  readonly vehicles: readonly CalendarVehicleOption[];
  readonly className?: string;
};

export function CalendarFilters({ state, vehicles, className }: CalendarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(state.search);
  const [driverInput, setDriverInput] = useState(state.driver);
  const [prevSearch, setPrevSearch] = useState(state.search);
  const [prevDriver, setPrevDriver] = useState(state.driver);
  const debouncedSearch = useDebounce(searchInput, 350);
  const debouncedDriver = useDebounce(driverInput, 350);

  if (state.search !== prevSearch) {
    setPrevSearch(state.search);
    setSearchInput(state.search);
  }

  if (state.driver !== prevDriver) {
    setPrevDriver(state.driver);
    setDriverInput(state.driver);
  }

  function navigate(updates: Partial<CalendarUrlState>) {
    const query = buildCalendarSearchParams(state, updates);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  const pushDebouncedSearch = useEffectEvent((value: string) => {
    if (value === state.search) {
      return;
    }
    navigate({ search: value });
  });

  const pushDebouncedDriver = useEffectEvent((value: string) => {
    if (value === state.driver) {
      return;
    }
    navigate({ driver: value });
  });

  useEffect(() => {
    pushDebouncedSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    pushDebouncedDriver(debouncedDriver);
  }, [debouncedDriver]);

  const filtersActive = hasActiveCalendarFilters(state);

  return (
    <div
      className={cn('rounded-xl border bg-card p-3 sm:p-4', isPending && 'opacity-80', className)}
      aria-busy={isPending}
      role="search"
      aria-label="Filter fleet calendar"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
          <Label htmlFor="calendar-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="calendar-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Invoice, customer, vehicle…"
              className={cn('pl-8', searchInput && 'pr-8')}
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
                  setPrevSearch('');
                  navigate({ search: '' });
                }}
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calendar-vehicle-filter">Vehicle</Label>
          <Select
            value={state.vehicleId || ALL_VALUE}
            onValueChange={(value) =>
              navigate({ vehicleId: value === ALL_VALUE ? '' : (value ?? '') })
            }
          >
            <SelectTrigger id="calendar-vehicle-filter" className="w-full">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All vehicles</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calendar-availability-filter">Availability</Label>
          <Select
            value={state.availability || ALL_VALUE}
            onValueChange={(value) =>
              navigate({ availability: value === ALL_VALUE ? '' : (value ?? '') })
            }
          >
            <SelectTrigger id="calendar-availability-filter" className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All</SelectItem>
              {VEHICLE_AVAILABILITY_STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {VEHICLE_AVAILABILITY_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calendar-status-filter">Booking Status</Label>
          <Select
            value={state.status || ALL_VALUE}
            onValueChange={(value) =>
              navigate({ status: value === ALL_VALUE ? '' : (value ?? '') })
            }
          >
            <SelectTrigger id="calendar-status-filter" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
              {CALENDAR_STATUS_FILTER_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {BOOKING_DISPLAY_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calendar-driver-filter">Driver</Label>
          <Input
            id="calendar-driver-filter"
            value={driverInput}
            onChange={(event) => setDriverInput(event.target.value)}
            placeholder="Driver name"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calendar-fuel-filter">Fuel Type</Label>
          <Select
            value={state.fuelType || ALL_VALUE}
            onValueChange={(value) =>
              navigate({ fuelType: value === ALL_VALUE ? '' : (value ?? '') })
            }
          >
            <SelectTrigger id="calendar-fuel-filter" className="w-full">
              <SelectValue placeholder="All fuels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All fuels</SelectItem>
              {FUEL_TYPE_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {FUEL_TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:col-span-2 xl:col-span-2 2xl:col-span-1">
          <div className="space-y-1.5">
            <Label htmlFor="calendar-from-filter">From</Label>
            <Input
              id="calendar-from-filter"
              type="date"
              value={state.from}
              onChange={(event) => navigate({ from: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calendar-to-filter">To</Label>
            <Input
              id="calendar-to-filter"
              type="date"
              value={state.to}
              onChange={(event) => navigate({ to: event.target.value })}
            />
          </div>
        </div>
      </div>

      {filtersActive ? (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                search: '',
                vehicleId: '',
                availability: '',
                status: '',
                driver: '',
                fuelType: '',
                from: '',
                to: '',
              })
            }
          >
            <RotateCw data-icon="inline-start" />
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
