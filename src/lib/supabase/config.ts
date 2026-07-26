/**
 * Central Supabase configuration.
 *
 * The single place where Supabase environment variables are read and
 * validated. Import `supabaseConfig` instead of reading `process.env`
 * directly — this guarantees a fail-fast, descriptive error when the
 * environment is misconfigured.
 *
 * Safe for every runtime (browser, Node.js, Edge). Contains only
 * public (`NEXT_PUBLIC_`) values; secrets must never be added here.
 */

export interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        'Copy .env.example to .env.local and set your Supabase project values.',
    );
  }
  return value;
}

// NEXT_PUBLIC_ variables must be referenced statically so Next.js can inline
// them into client bundles at build time.
export const supabaseConfig: SupabaseConfig = {
  url: requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
