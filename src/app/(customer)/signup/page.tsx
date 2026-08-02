import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Sign Up',
};

/** Placeholder — customer signup lands in a later phase. */
export default function CustomerSignupPage() {
  return (
    <CustomerPlaceholderPage
      title="Sign Up"
      description="Customer registration will be added in a later phase. It will share Supabase Auth with staff accounts while using a distinct customer role and route guards."
    />
  );
}
