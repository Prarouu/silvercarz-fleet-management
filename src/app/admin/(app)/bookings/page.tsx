import { countBookings, listBookings } from '@/features/bookings/actions';
import { BookingList } from '@/features/bookings/components';
import {
  parseBookingListUrlState,
  toBookingListQuery,
} from '@/features/bookings/lib/booking-list-params';
import { BOOKING_DISPLAY_STATUSES } from '@/features/bookings/service/status.service';

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
    />
  );
}
