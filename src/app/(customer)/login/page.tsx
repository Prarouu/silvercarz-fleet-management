import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Login',
};

/** Placeholder — customer authentication lands in a later phase. */
export default function CustomerLoginPage() {
  return (
    <CustomerPlaceholderPage
      title="Customer Login"
      description="Customer sign-in will use the existing Supabase Auth project, separate from /admin/login. Authentication UI is intentionally not implemented in C0."
    />
  );
}
