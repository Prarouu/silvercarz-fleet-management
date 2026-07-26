import 'server-only';

/**
 * Profile loading and mapping.
 *
 * Profiles are the source of truth for role and active status.
 * Rows are created by the `handle_new_user` database trigger.
 */

import { isAppRole } from '@/lib/auth/roles';
import type { AuthUser, UserProfile } from '@/lib/auth/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

type ProfileRow = Tables<'profiles'>;

/** Maps a `profiles` row into the app-facing `UserProfile` shape. */
export function toUserProfile(row: ProfileRow): UserProfile | null {
  if (!isAppRole(row.role)) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Builds an `AuthUser` from a validated profile. */
export function toAuthUserFromProfile(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };
}

/**
 * Loads the profile for `userId`, or `null` when missing / unreadable.
 * Does not throw on query failures — callers decide fail-open vs fail-closed.
 */
export async function getProfileById(userId: string): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toUserProfile(data);
}

/**
 * Returns the profile for the current authenticated user, or `null`.
 * Requires a valid session (RLS: own row / staff select).
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return getProfileById(user.id);
}
