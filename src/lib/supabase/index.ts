/**
 * Public entry point for runtime-agnostic Supabase infrastructure.
 *
 * Import configuration, error utilities, and shared types from here:
 *
 *   import { supabaseConfig, normalizeSupabaseError } from '@/lib/supabase';
 *
 * The clients are deliberately NOT re-exported, because they are bound to
 * specific runtimes and must be imported directly:
 *
 *   - Client Components:            '@/lib/supabase/client'
 *   - Server Components / Actions:  '@/lib/supabase/server'
 *   - Next.js Proxy (session):      '@/lib/supabase/middleware'
 *
 * Application code must never import from '@supabase/supabase-js' or
 * '@supabase/ssr' directly — all Supabase usage stays behind this layer.
 *
 * Authentication helpers live in `@/lib/auth` — not here.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

export { supabaseConfig, type SupabaseConfig } from './config';
export { normalizeSupabaseError, getErrorMessage, type NormalizedError } from './errors';

/** Shared client type for typing function parameters in future modules. */
export type TypedSupabaseClient = SupabaseClient<Database>;
