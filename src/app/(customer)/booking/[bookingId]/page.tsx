import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Booking',
};

/** Placeholder — customer booking request detail (future). */
export default async function CustomerBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <CustomerPlaceholderPage
      title="Booking request"
      description={`Placeholder for booking "${bookingId}". Customers will create requests for admin review — not confirmed bookings — in a later phase.`}
    />
  );
}
