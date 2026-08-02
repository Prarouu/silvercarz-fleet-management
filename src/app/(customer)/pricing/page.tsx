import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Pricing',
};

/** Placeholder — pricing content lands in a later phase. */
export default function PricingPage() {
  return (
    <CustomerPlaceholderPage
      title="Pricing"
      description="This route is reserved for public pricing information. Rate details will be added in a later phase."
    />
  );
}
