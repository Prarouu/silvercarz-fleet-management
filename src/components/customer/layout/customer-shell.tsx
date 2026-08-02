import type { ReactNode } from 'react';

import { CustomerFooter } from '@/components/customer/footer/customer-footer';
import { CustomerHeader } from '@/components/customer/header/customer-header';
import { PortalThemeScope } from '@/components/shared/portal-theme-scope';

/**
 * Customer portal chrome — header, main, footer.
 * Applies the customer token scope without touching the Admin shell.
 */
export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <div data-portal="customer" className="flex min-h-svh flex-col bg-background text-foreground">
      <PortalThemeScope portal="customer" />
      <CustomerHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <CustomerFooter />
    </div>
  );
}
