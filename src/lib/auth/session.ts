import 'server-only';

/**
 * Server-side session utilities.
 *
 * Prefer `getCurrentUser` / `getAuthState` for authorization checks — they
 * call `auth.getUser()`, which validates the JWT with Supabase Auth.
 * Do not rely on cookie contents alone for security decisions.
 *
 * Role and display name are loaded from `profiles` (not JWT claims alone).
 * Auth helpers are wrapped in `React.cache` so layout + services share one
 * Auth + profile round-trip per request.
 */

import type { Session, User } from '@supabase/supabase-js';
import { cache } from 'react';

import { getProfileById } from '@/lib/auth/profile';
import type { AppRole } from '@/lib/auth/roles';
import type { AuthState, AuthUser } from '@/lib/auth/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Maps a Supabase `User` into a minimal `AuthUser` (no profile yet).
 * Prefer `getCurrentUser`, which enriches from `profiles`.
 *
 * Role comes only from `profiles` (or an explicit caller override).
 * Never trust `app_metadata.role` — public signup must not inherit staff.
 */
export function toAuthUser(
  user: User,
  extras?: { fullName?: string | null; role?: AppRole | null },
): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: extras?.fullName ?? null,
    role: extras?.role ?? null,
  };
}

/**
 * Returns the validated current user, or `null` when unauthenticated.
 * Uses `getUser()` so the token is verified with Supabase Auth.
 * When a profile exists, role and full name come from `profiles`.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { user } = await getAuthState();
  return user;
}

/**
 * Returns the raw cookie session without re-validating with Auth.
 * Prefer `getCurrentUser` for access control. Use this only when session
 * metadata (e.g. access token expiry) is needed.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/** Convenience boolean for authenticated state checks. */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/** Bundled auth state for Server Components and Server Actions. */
export const getAuthState = cache(async (): Promise<AuthState> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
    };
  }

  const profile = await getProfileById(user.id);

  return {
    user: profile
      ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
        }
      : toAuthUser(user),
    profile,
    isAuthenticated: true,
  };
});

/**
 * Role for the current user from `profiles`.
 * Returns `null` when unauthenticated, missing profile, or inactive.
 */
export async function getCurrentUserRole(): Promise<AppRole | null> {
  const profile = (await getAuthState()).profile;

  if (!profile || !profile.isActive) {
    return null;
  }

  return profile.role;
}
