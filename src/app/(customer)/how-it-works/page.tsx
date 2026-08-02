import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'How It Works',
};

/** Placeholder — how-it-works content lands in a later phase. */
export default function HowItWorksPage() {
  return (
    <CustomerPlaceholderPage
      title="How It Works"
      description="This route is reserved for the booking process overview. Step-by-step content will be added in a later phase."
    />
  );
}
