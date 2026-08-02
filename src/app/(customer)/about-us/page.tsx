import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';
import { appConfig } from '@/config';

export const metadata: Metadata = {
  title: 'About Us',
};

/** Placeholder — About content lands in a later phase. */
export default function AboutUsPage() {
  return (
    <CustomerPlaceholderPage
      title="About Us"
      description={`Learn more about ${appConfig.companyName}. Full company story and content will be published in a later phase.`}
    />
  );
}
