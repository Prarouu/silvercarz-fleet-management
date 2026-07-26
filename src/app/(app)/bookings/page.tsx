import { BookingList } from '@/features/bookings/components';
import { listBookings } from '@/features/bookings/actions';
import {
  parseBookingListUrlState,
  toBookingListQuery,
} from '@/features/bookings/lib/booking-list-params';

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const state = parseBookingListUrlState(params);
  const query = toBookingListQuery(state);
  const response = await listBookings(query);

  if (!response.success) {
    return <BookingList state={state} result={null} errorMessage={response.error.message} />;
  }

  return <BookingList state={state} result={response.data} />;
}
