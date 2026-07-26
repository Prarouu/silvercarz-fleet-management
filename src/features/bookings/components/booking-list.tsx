import { CalendarPlus, Plus } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BookingListError } from '@/features/bookings/components/booking-list-error';
import { BookingListPagination } from '@/features/bookings/components/booking-list-pagination';
import { BookingListRefreshButton } from '@/features/bookings/components/booking-list-refresh-button';
import { BookingListTable } from '@/features/bookings/components/booking-list-table';
import { BookingListToolbar } from '@/features/bookings/components/booking-list-toolbar';
import {
  hasActiveBookingListFilters,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import type { BookingWithVehicle, PaginatedResult } from '@/types';

type BookingListProps = {
  readonly state: BookingListUrlState;
  readonly result: PaginatedResult<BookingWithVehicle> | null;
  readonly errorMessage?: string;
};

function NewBookingButton() {
  return (
    <Button asChild>
      <Link href={ROUTES.bookingsNew}>
        <Plus data-icon="inline-start" />
        New Booking
      </Link>
    </Button>
  );
}

export function BookingList({ state, result, errorMessage }: BookingListProps) {
  const filtersActive = hasActiveBookingListFilters(state);

  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <PageHeader
        title="Bookings"
        description="Search, filter, and manage rental bookings for the Silver Carz fleet."
      >
        <NewBookingButton />
      </PageHeader>

      <BookingListToolbar state={state} />

      {errorMessage ? <BookingListError description={errorMessage} /> : null}

      {!errorMessage && result && result.data.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title={filtersActive ? 'No matching bookings' : 'No bookings yet'}
          description={
            filtersActive
              ? 'Try adjusting your search or filters to find what you need.'
              : 'When you create a booking, it will show up here for the team to manage.'
          }
          action={
            filtersActive ? (
              <BookingListRefreshButton label="Clear filters" clearFilters />
            ) : (
              <NewBookingButton />
            )
          }
        />
      ) : null}

      {!errorMessage && result && result.data.length > 0 ? (
        <div className="space-y-4">
          <BookingListTable data={result.data} state={state} />
          <BookingListPagination state={state} meta={result.meta} />
        </div>
      ) : null}
    </PageContainer>
  );
}
