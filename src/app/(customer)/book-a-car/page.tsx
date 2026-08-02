import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Book a Car',
};

/** Placeholder — vehicle browsing lands in a later phase. */
export default function BookACarPage() {
  return (
    <CustomerPlaceholderPage
      title="Book a Car"
      description="This route is reserved for the self-drive booking experience. Vehicle browsing and booking requests will be implemented in a later phase."
    />
  );
}
