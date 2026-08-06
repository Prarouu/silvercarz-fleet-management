import { countBookings, listBookings } from '@/features/bookings/actions';
import { BookingList } from '@/features/bookings/components';
import {
  parseBookingListUrlState,
  toBookingListQuery,
  BOOKING_LIST_VIEWS,
} from '@/features/bookings/lib/booking-list-params';
import { BOOKING_DISPLAY_STATUSES } from '@/features/bookings/service/status.service';
import { getBookingDocumentRepository } from '@/features/booking-documents/repository/booking-document-repository';

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const state = parseBookingListUrlState(params);
  const query = toBookingListQuery(state);

  const [listResponse, pendingCountResponse, confirmedCountResponse] = await Promise.all([
    listBookings(query),
    countBookings({ status: BOOKING_DISPLAY_STATUSES.draft }),
    countBookings({ excludeDraft: true }),
  ]);

  const pendingCount = pendingCountResponse.success ? pendingCountResponse.data : null;
  const confirmedCount = confirmedCountResponse.success ? confirmedCountResponse.data : null;

  let documentCounts: Record<string, number> = {};

  if (
    listResponse.success &&
    state.view === BOOKING_LIST_VIEWS.pending &&
    listResponse.data.data.length > 0
  ) {
    const counts = await getBookingDocumentRepository().countByBookingIds(
      listResponse.data.data.map((booking) => booking.id),
    );
    documentCounts = Object.fromEntries(counts.entries());
  }

  if (!listResponse.success) {
    return (
      <BookingList
        state={state}
        result={null}
        pendingCount={pendingCount}
        confirmedCount={confirmedCount}
        errorMessage={listResponse.error.message}
      />
    );
  }

  return (
    <BookingList
      state={state}
      result={listResponse.data}
      pendingCount={pendingCount}
      confirmedCount={confirmedCount}
      documentCounts={documentCounts}
    />
  );
}
