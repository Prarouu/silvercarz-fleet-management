/**
 * Supabase session helpers for the Next.js Proxy (formerly Middleware).
 *
 * `updateSession` refreshes expired auth tokens and keeps cookies in sync
 * between the request and response. It must be called from `src/proxy.ts`
 * on matched requests so Server Components can read a valid session.
 *
 * Do NOT use outside the proxy entrypoint. Server code uses
 * `@/lib/supabase/server`; client code uses `@/lib/supabase/client`.
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
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  return {
    supabase,
    /** Always return this response from the proxy so cookie updates are kept. */
    getResponse: () => response,
  };
}

/**
 * Refreshes the Supabase auth session for the current request.
 *
 * Important: call `getUser()` immediately after creating the client — do not
 * run other logic in between. Always return the response from
 * `getResponse()` so refreshed cookies reach the browser.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);

  // Validates the JWT and refreshes tokens when needed.
  await supabase.auth.getUser();

  return getResponse();
}
