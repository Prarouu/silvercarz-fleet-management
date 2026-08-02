import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Confirmation',
};

/** Placeholder — confirmation after verified payment (future). */
export default async function CustomerBookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <CustomerPlaceholderPage
      title="Confirmation"
      description={`Placeholder confirmation for booking "${bookingId}". Confirmed status follows verified payment in a later phase.`}
    />
  );
}
