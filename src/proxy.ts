/**
 * Next.js Proxy — authentication session refresh and route guards.
 *
 * Runs before matched requests reach the App Router. Responsibilities:
 *   1. Refresh Supabase Auth cookies via `updateSession`
 *   2. Redirect unauthenticated users away from protected routes
 *   3. Redirect authenticated users away from auth screens (e.g. /login)
 *
 * Route classification lives in `@/lib/auth/route-guards` (via `ROUTES`).
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
