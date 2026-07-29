import { CalendarPlus, Plus } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import {
  UpcomingPickups,
  UpcomingReturns,
} from '@/features/calendar/components/calendar-agenda-sections';
import { CalendarFilters } from '@/features/calendar/components/calendar-filters';
import { CalendarGrid } from '@/features/calendar/components/calendar-grid';
import { CalendarSummaryCards } from '@/features/calendar/components/calendar-summary-cards';
import { CalendarToolbar } from '@/features/calendar/components/calendar-toolbar';
import { FleetTimeline } from '@/features/calendar/components/fleet-timeline';
import {
  hasActiveCalendarFilters,
  type CalendarUrlState,
} from '@/features/calendar/lib/calendar-params';
import type { CalendarPageData } from '@/features/calendar/types';

type CalendarPageProps = {
  readonly state: CalendarUrlState;
  readonly data: CalendarPageData | null;
  readonly errorMessage?: string;
};

function NewBookingButton() {
  return (
    <Button asChild>
      <Link href={ROUTES.bookingsNew}>
        <Plus data-icon="inline-start" />
        Create Booking
      </Link>
    </Button>
  );
}

export function CalendarPage({ state, data, errorMessage }: CalendarPageProps) {
  const filtersActive = hasActiveCalendarFilters(state);
  const hasEvents = Boolean(data && data.events.length > 0);
  const showEmpty = Boolean(data && !hasEvents && !errorMessage);

  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <PageHeader
        title="Fleet Calendar"
        description="Monitor vehicle bookings, availability and rental schedules."
      >
        <NewBookingButton />
      </PageHeader>

      {data ? <CalendarSummaryCards summary={data.summary} /> : null}

      <CalendarFilters state={state} vehicles={data?.vehicles ?? []} />

      {data ? (
        <CalendarToolbar state={state} rangeStart={data.rangeStart} rangeEnd={data.rangeEnd} />
      ) : null}

      {errorMessage ? (
        <ErrorState title="Unable to load calendar" description={errorMessage} />
      ) : null}

      {showEmpty ? (
        <EmptyState
          icon={CalendarPlus}
          title={filtersActive ? 'No matching schedule' : 'No bookings on the calendar'}
          description={
            filtersActive
              ? 'Try adjusting filters or the date range to see fleet activity.'
              : 'Create a booking to start tracking vehicle occupancy and rental schedules.'
          }
          action={<NewBookingButton />}
        />
      ) : null}

      {data && !errorMessage ? (
        <>
          {!showEmpty || data.timeline.some((row) => row.blocks.length > 0) ? (
            <CalendarGrid
              view={state.view}
              rangeStart={data.rangeStart}
              rangeEnd={data.rangeEnd}
              events={data.events}
              asOfDate={data.asOfDate}
            />
          ) : null}

          <FleetTimeline
            rows={data.timeline}
            rangeStart={data.rangeStart}
            rangeEnd={data.rangeEnd}
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <UpcomingPickups items={data.upcomingPickups} />
            <UpcomingReturns items={data.upcomingReturns} />
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
