import { notFound } from 'next/navigation';

import { getBookingWithVehicle } from '@/features/bookings/actions/get-booking';
import { BookingDetailPage } from '@/features/bookings/components/booking-detail-page';
import { BOOKING_ERROR_CODES } from '@/features/bookings/errors';
import { getProfileById } from '@/lib/auth/profile';

type BookingDetailRouteProps = {
  readonly params: Promise<{ id: string }>;
};

export default async function BookingDetailRoute({ params }: BookingDetailRouteProps) {
  const { id } = await params;
  const response = await getBookingWithVehicle(id);

  if (!response.success) {
    if (response.error.code === BOOKING_ERROR_CODES.notFound) {
      notFound();
    }

    return (
      <BookingDetailPage loadError={response.error.message || 'Unable to load this booking.'} />
    );
  }

  const booking = response.data;
  let createdByLabel: string | null = null;

  if (booking.created_by) {
    const profile = await getProfileById(booking.created_by);
    createdByLabel = profile?.fullName?.trim() || profile?.email || 'Staff member';
  }

  return <BookingDetailPage booking={booking} createdByLabel={createdByLabel} />;
}
