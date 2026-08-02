'use client';

import Link from 'next/link';

import {
  buildCustomerBookACarSearchParams,
  type CustomerAvailabilityFilter,
  type CustomerBookACarUrlState,
  type CustomerPriceFilter,
} from '@/features/vehicles/lib/public-vehicle-list-params';
import { cn } from '@/lib/utils';

const AVAILABILITY_OPTIONS: { value: CustomerAvailabilityFilter; label: string }[] = [
  { value: 'all', label: 'All Cars' },
  { value: 'available', label: 'Available' },
];

const PRICE_OPTIONS: { value: CustomerPriceFilter; label: string }[] = [
  { value: 'all', label: 'Any Price' },
  { value: 'under-2000', label: 'Under ₹2,000' },
  { value: '2000-4000', label: '₹2,000 – ₹4,000' },
  { value: '4000-plus', label: '₹4,000+' },
];

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        'inline-flex h-9 items-center rounded-md border px-3 text-xs font-semibold tracking-wide uppercase transition-colors sm:text-sm',
        active
          ? 'border-secondary bg-secondary text-secondary-foreground'
          : 'border-border bg-background text-foreground hover:border-foreground/40',
      )}
    >
      {children}
    </Link>
  );
}

export function BookACarFilters({ state }: { state: CustomerBookACarUrlState }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Availability filter">
        {AVAILABILITY_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            active={state.availability === option.value}
            href={buildCustomerBookACarSearchParams(state, {
              availability: option.value,
              page: 1,
            })}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Price filter">
        {PRICE_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            active={state.price === option.value}
            href={buildCustomerBookACarSearchParams(state, {
              price: option.value,
              page: 1,
            })}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
