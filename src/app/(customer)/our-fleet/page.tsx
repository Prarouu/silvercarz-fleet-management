import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Our Fleet',
};

/** Placeholder — fleet showcase lands in a later phase. */
export default function OurFleetPage() {
  return (
    <CustomerPlaceholderPage
      title="Our Fleet"
      description="This route is reserved for the public fleet showcase. Live vehicle listings will connect to the existing vehicles data in a later phase."
    />
  );
}
