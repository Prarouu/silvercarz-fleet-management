/**
 * Central Supabase configuration.
 *
 * The single place where Supabase environment variables are read and
 * validated. Import `supabaseConfig` instead of reading `process.env`
 * directly — this guarantees a fail-fast, descriptive error when the
 * environment is misconfigured.
 *
 * Values are resolved lazily on first access so Next.js can load route
 * modules during `next build` (e.g. `/_not-found`) without requiring
 * env vars at import time. Accessing `.url` / `.anonKey` still throws
 * immediately if a variable is missing.
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

function readConfig(): SupabaseConfig {
  // NEXT_PUBLIC_ variables must be referenced statically so Next.js can inline
  // them into client bundles at build time.
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

let cached: SupabaseConfig | undefined;

function getConfig(): SupabaseConfig {
  return (cached ??= readConfig());
}

/**
 * Validated Supabase public config. Prefer this over reading `process.env`.
 * Accessors throw if the environment is missing required values.
 */
export const supabaseConfig: SupabaseConfig = {
  get url() {
    return getConfig().url;
  },
  get anonKey() {
    return getConfig().anonKey;
  },
};
