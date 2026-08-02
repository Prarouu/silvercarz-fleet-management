import { AppShell } from '@/components/layout/app-shell';
import { PortalThemeScope } from '@/components/shared/portal-theme-scope';
import { requireAuth } from '@/lib/auth';

/**
 * Layout for the authenticated application area.
 *
 * Proxy (`src/proxy.ts`) performs optimistic redirects. `requireAuth`
 * guarantees a signed-in user with an active profile before the shell.
 *
 * Always render from live database / session data — never serve a static snapshot.
 */
export const dynamic = 'force-dynamic';

export default async function AppAreaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <>
      <PortalThemeScope portal="admin" />
      <AppShell user={user}>{children}</AppShell>
    </>
  );
}
