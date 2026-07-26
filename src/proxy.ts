/**
 * Next.js Proxy — authentication session refresh.
 *
 * Runs before matched requests reach the App Router. Responsibilities in
 * this phase:
 *   1. Refresh Supabase Auth cookies via `updateSession`
 *   2. Keep the proxy lightweight (no business logic)
 *
 * Route protection helpers live in `@/lib/auth/route-guards`. Enforcement
 * (redirect unauthenticated users to login) lands with the Login UI phase
 * so the app remains usable before those screens exist.
 */

import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon and common image assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
