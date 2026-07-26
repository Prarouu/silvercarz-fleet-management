import { AppShell } from '@/components/layout/app-shell';

/**
 * Layout for the application area. Authentication will guard this route
 * group in Phase 2 — the shell itself needs no changes for that.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
