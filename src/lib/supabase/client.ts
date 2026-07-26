'use client';

/**
 * Supabase client for Client Components ("use client" modules) only.
 *
 * Use when the browser needs to talk to Supabase directly, e.g. realtime
 * subscriptions or client-side session reads.
 *
 * Do NOT use in Server Components, Server Actions, or Route Handlers —
 * import from `@/lib/supabase/server` there instead. The 'use client'
 * directive above makes server-side imports of this module a build error.
 */

import { createBrowserClient } from '@supabase/ssr';

import { supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

/**
 * Returns the browser Supabase client.
 * `createBrowserClient` reuses a single instance per browser tab, so calling
 * this in multiple components does not create duplicate connections.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);
}
