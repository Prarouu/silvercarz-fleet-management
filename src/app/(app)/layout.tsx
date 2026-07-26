import { AppShell } from '@/components/layout/app-shell';
import { requireAuth } from '@/lib/auth';

/**
 * Layout for the authenticated application area.
 *
 * Proxy (`src/proxy.ts`) performs optimistic redirects. `requireAuth`
 * is the server-side guarantee before rendering the app shell.
 */
export default async function AppAreaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return <AppShell user={user}>{children}</AppShell>;
}
