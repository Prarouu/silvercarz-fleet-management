import 'server-only';

/**
 * Supabase client for the server: Server Components, Server Actions, and
 * Route Handlers.
 *
 * Reads and writes the auth session from request cookies via `next/headers`.
 * Use `React.cache` so layout + services share one client per request.
 * Do not store the client in a module-level variable across requests.
 *
 * Do NOT use in Client Components — import from `@/lib/supabase/client`
 * there instead. The `server-only` import above makes client-side imports
 * of this module a build error.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export const createSupabaseServerClient = cache(async () => {
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
});
