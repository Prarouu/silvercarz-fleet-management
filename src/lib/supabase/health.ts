import 'server-only';

/**
 * Infrastructure-level connection verification.
 *
 * Pings Supabase's public auth health endpoint to confirm the URL and anon
 * key are valid and the project is reachable. Touches no tables, needs no
 * authentication, and creates no data.
 *
 * Intended for temporary use while setting up an environment (e.g. called
 * once from a Server Component or a throwaway script). This file is safe
 * to delete once real modules exercise the connection.
 */

import { supabaseConfig } from '@/lib/supabase/config';

export interface ConnectionStatus {
  readonly ok: boolean;
  readonly message: string;
}

export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  try {
    const response = await fetch(`${supabaseConfig.url}/auth/v1/health`, {
      headers: { apikey: supabaseConfig.anonKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Supabase responded with status ${response.status}. Check your project URL and anon key.`,
      };
    }

    return { ok: true, message: 'Supabase connection verified.' };
  } catch (error) {
    return {
      ok: false,
      message: `Could not reach Supabase: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}
