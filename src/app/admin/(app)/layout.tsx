import { AppShell } from '@/components/layout/app-shell';
import { PortalThemeScope } from '@/components/shared/portal-theme-scope';
import { requireStaffAuth } from '@/lib/auth';

/**
 * Layout for the authenticated application area.
 *
 * Proxy (`src/proxy.ts`) performs optimistic redirects. `requireStaffAuth`
 * guarantees an active staff profile (`owner` | `manager`) before the shell.
 * Customers are redirected to the public site.
 *
 * Always render from live database / session data — never serve a static snapshot.
 */
export const dynamic = 'force-dynamic';

export default async function AppAreaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffAuth();

  return (
    <>
      <PortalThemeScope portal="admin" />
      <AppShell user={user}>{children}</AppShell>
    </>
  );
}
