/**
 * Placeholder for generated Supabase database types.
 *
 * Once a database schema exists, replace this file's contents with the
 * output of the Supabase type generator:
 *
 *   pnpm dlx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
 *
 * All Supabase clients are already typed against `Database`, so regenerating
 * this file is the only step needed to get end-to-end type safety.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
