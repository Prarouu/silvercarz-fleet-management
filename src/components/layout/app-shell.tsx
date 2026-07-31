import { cookies } from 'next/headers';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { STORAGE_KEYS } from '@/constants/storage';
import type { AuthUser } from '@/lib/auth/types';

/**
 * The application shell: sidebar + header + scrollable main area.
 * Authenticated pages render inside this via the `(app)` route group layout.
 *
 * Sidebar open state is restored from the cookie on the server so the gap
 * width matches the user's preference on first paint (avoids CLS).
 */
export async function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get(STORAGE_KEYS.sidebarState)?.value;
  const defaultOpen = sidebarCookie !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <AppHeader user={user} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
