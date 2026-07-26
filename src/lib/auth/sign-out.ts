import 'server-only';

/**
 * Server-side sign-out helper.
 *
 * Clears the Supabase Auth session cookies for the current request.
 * Intended for Server Actions. Login UI will call this from a form action.
 */

import { toAuthError } from '@/lib/auth/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw toAuthError(error);
  }
}
