import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Car Pooling',
};

/** Placeholder — car pooling lands in a later phase. */
export default function CarPoolingPage() {
  return (
    <CustomerPlaceholderPage
      title="Car Pooling"
      description="This route is reserved for the car pooling experience. Route search and ride selection will be implemented in a later phase."
    />
  );
}
