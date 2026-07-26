import { AppShell } from '@/components/layout/app-shell';

/**
 * Layout for the application area.
 *
 * Session refresh runs in `src/proxy.ts`. Page-level auth guards
 * (`requireAuth`) and proxy redirects land with the Login UI phase.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
