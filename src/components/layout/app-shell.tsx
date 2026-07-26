import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { AuthUser } from '@/lib/auth/types';

/**
 * The application shell: sidebar + header + scrollable main area.
 * Authenticated pages render inside this via the `(app)` route group layout.
 */
export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
