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
import {
  VEHICLE_AVAILABILITY_FILTER_OPTIONS,
  VEHICLE_STATUS_FILTERS,
  buildVehicleListSearchParams,
  type VehicleListUrlState,
} from '@/features/vehicles/lib/vehicle-list-params';
import { useDebounce } from '@/hooks';
import { FUEL_TYPE_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

type VehicleListToolbarProps = {
  readonly state: VehicleListUrlState;
  readonly className?: string;
};

export function VehicleListToolbar({ state, className }: VehicleListToolbarProps) {
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

  function navigate(updates: Partial<VehicleListUrlState>) {
    const query = buildVehicleListSearchParams(state, updates);
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

  const hasFilters = Boolean(state.search || state.fuelType || state.availability || state.status);

  return (
    <div
      className={cn('rounded-3xl border bg-card p-3 sm:p-4', isPending && 'opacity-80', className)}
      aria-busy={isPending}
      role="search"
      aria-label="Filter vehicles"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label htmlFor="vehicle-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="vehicle-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Vehicle name or number…"
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

          <div className="space-y-1.5">
            <Label htmlFor="vehicle-fuel-filter">Fuel type</Label>
            <Select
              value={state.fuelType || ALL_VALUE}
              onValueChange={(value) =>
                navigate({
                  fuelType: value === ALL_VALUE ? '' : (value ?? ''),
                  page: 1,
                })
              }
            >
              <SelectTrigger id="vehicle-fuel-filter" className="w-full" size="default">
                <SelectValue placeholder="All fuel types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All fuel types</SelectItem>
                {FUEL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicle-availability-filter">Availability</Label>
            <Select
              value={state.availability || ALL_VALUE}
              onValueChange={(value) =>
                navigate({
                  availability: value === ALL_VALUE ? '' : (value ?? ''),
                  page: 1,
                })
              }
            >
              <SelectTrigger id="vehicle-availability-filter" className="w-full" size="default">
                <SelectValue placeholder="All availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All availability</SelectItem>
                {VEHICLE_AVAILABILITY_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicle-status-filter">Status</Label>
            <Select
              value={state.status || ALL_VALUE}
              onValueChange={(value) =>
                navigate({
                  status: value === ALL_VALUE ? '' : (value ?? ''),
                  page: 1,
                })
              }
            >
              <SelectTrigger id="vehicle-status-filter" className="w-full" size="default">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                <SelectItem value={VEHICLE_STATUS_FILTERS.active}>Active</SelectItem>
                <SelectItem value={VEHICLE_STATUS_FILTERS.inactive}>Inactive</SelectItem>
              </SelectContent>
            </Select>
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
            aria-label="Refresh vehicles"
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
