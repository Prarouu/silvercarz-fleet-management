import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Profile',
};

/** Placeholder — customer profile lands after auth. */
export default function ProfilePage() {
  return (
    <CustomerPlaceholderPage
      title="Profile"
      description="This account route will manage the signed-in customer's profile. It remains a public placeholder in C0 — protection arrives with customer auth."
    />
  );
}
