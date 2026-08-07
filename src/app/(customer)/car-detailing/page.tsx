import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Car Detailing',
};

/** Placeholder — detailing service lands in a later phase. */
export default function CarDetailingPage() {
  return (
    <CustomerPlaceholderPage
      title="Car Detailing"
      description="This route is reserved for car detailing services. Service options and requests will be implemented in a later phase."
    />
  );
}
