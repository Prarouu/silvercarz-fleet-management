import type { ReactNode } from 'react';

import { CustomerShell } from '@/components/customer/layout/customer-shell';

/**
 * Customer portal layout — public marketing + booking chrome.
 * Admin routes under `/admin` use a separate layout and are unaffected.
 */
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
