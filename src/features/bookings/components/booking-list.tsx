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
import { BookingListTabs } from '@/features/bookings/components/booking-list-tabs';
import { BookingListToolbar } from '@/features/bookings/components/booking-list-toolbar';
import {
  BOOKING_LIST_VIEWS,
  buildBookingListSearchParams,
  hasActiveBookingListFilters,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import type { BookingWithVehicle, PaginatedResult } from '@/types';

type BookingListProps = {
  readonly state: BookingListUrlState;
  readonly result: PaginatedResult<BookingWithVehicle> | null;
  readonly pendingCount: number | null;
  readonly confirmedCount: number | null;
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

export function BookingList({
  state,
  result,
  pendingCount,
  confirmedCount,
  errorMessage,
}: BookingListProps) {
  const filtersActive = hasActiveBookingListFilters(state);
  const isPendingView = state.view === BOOKING_LIST_VIEWS.pending;
  const clearFiltersHref = (() => {
    const query = buildBookingListSearchParams(state, {
      search: '',
      status: isPendingView ? 'draft' : '',
      mode: '',
      page: 1,
    });
    return query ? `${ROUTES.bookings}?${query}` : ROUTES.bookings;
  })();

  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <PageHeader
        title="Bookings"
        description={
          isPendingView
            ? 'Review customer booking requests waiting for approval.'
            : 'Manage confirmed and active rental bookings for the Silver Carz fleet.'
        }
      >
        <NewBookingButton />
      </PageHeader>

      <div className="space-y-4">
        <BookingListTabs
          state={state}
          pendingCount={pendingCount}
          confirmedCount={confirmedCount}
        />

        <BookingListToolbar state={state} />

        {errorMessage ? <BookingListError description={errorMessage} /> : null}

        {!errorMessage && result && result.data.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title={
              filtersActive
                ? 'No matching bookings'
                : isPendingView
                  ? 'No pending requests'
                  : 'No confirmed bookings'
            }
            description={
              filtersActive
                ? 'Try adjusting your search or filters to find what you need.'
                : isPendingView
                  ? 'New customer booking requests will appear here for approval.'
                  : 'When a booking is approved or created by staff, it will show up here.'
            }
            action={
              filtersActive ? (
                <BookingListRefreshButton
                  label="Clear filters"
                  clearFilters
                  clearHref={clearFiltersHref}
                />
              ) : isPendingView ? undefined : (
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
      </div>
    </PageContainer>
  );
}
