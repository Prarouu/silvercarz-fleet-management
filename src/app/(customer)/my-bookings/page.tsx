import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'My Bookings',
};

/** Placeholder — customer bookings list lands after auth + booking request flow. */
export default function MyBookingsPage() {
  return (
    <CustomerPlaceholderPage
      title="My Bookings"
      description="This account route will list the signed-in customer's booking requests. It remains a public placeholder in C0 — protection arrives with customer auth."
    />
  );
}
