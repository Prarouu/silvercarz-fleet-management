import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Payment',
};

/** Placeholder — payment step after admin approval (future). */
export default async function CustomerBookingPaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <CustomerPlaceholderPage
      title="Payment"
      description={`Placeholder payment step for booking "${bookingId}". Payment follows admin approval in a later phase.`}
    />
  );
}
