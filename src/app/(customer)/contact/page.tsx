import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';
import { appConfig } from '@/config';

export const metadata: Metadata = {
  title: 'Contact Us',
};

/** Placeholder — contact details land when business info is available. */
export default function ContactPage() {
  return (
    <CustomerPlaceholderPage
      title="Contact Us"
      description={`Get in touch with ${appConfig.companyName}. Contact details and forms will be published when available — no invented business information is shown in C0.`}
    />
  );
}
