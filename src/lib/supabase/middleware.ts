/**
 * Supabase client for Next.js middleware (Edge runtime).
 *
 * Prepared for the authentication phase: middleware will use this to
 * refresh expired auth sessions and keep cookies in sync between the
 * request and response. It is intentionally not wired into a
 * `src/middleware.ts` yet — no auth logic exists in this phase.
 *
 * Do NOT use outside middleware. Server code uses `@/lib/supabase/server`;
 * client code uses `@/lib/supabase/client`.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // Recreate the response so refreshed cookies propagate downstream.
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  return {
    supabase,
    /** Always return this response from middleware so cookie updates are kept. */
    getResponse: () => response,
  };
}
