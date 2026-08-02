import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Documents',
};

/** Placeholder — document submission step (future). */
export default async function CustomerBookingDocumentsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <CustomerPlaceholderPage
      title="Documents"
      description={`Placeholder document step for booking "${bookingId}". Upload and verification land in a later phase.`}
    />
  );
}
