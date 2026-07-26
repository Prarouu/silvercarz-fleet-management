import 'server-only';

/**
 * Supabase client for the server: Server Components, Server Actions, and
 * Route Handlers.
 *
 * Reads and writes the auth session from request cookies via `next/headers`.
 * A new client must be created per request (never cached in a module-level
 * variable), because it is bound to the current request's cookies.
 *
 * Do NOT use in Client Components — import from `@/lib/supabase/client`
 * there instead. The `server-only` import above makes client-side imports
 * of this module a build error.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, _headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `cookies().set` throws inside Server Components (read-only
          // context). Safe to ignore: session refresh is handled by the
          // Next.js Proxy via `updateSession`.
        }
      },
    },
  });
}
