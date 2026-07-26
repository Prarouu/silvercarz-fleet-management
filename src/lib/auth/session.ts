import 'server-only';

/**
 * Server-side session utilities.
 *
 * Prefer `getCurrentUser` / `getAuthState` for authorization checks — they
 * call `auth.getUser()`, which validates the JWT with Supabase Auth.
 * Do not rely on cookie contents alone for security decisions.
 */

import type { Session, User } from '@supabase/supabase-js';

import type { AppRole, AuthState, AuthUser } from '@/lib/auth/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const KNOWN_ROLES = new Set<AppRole>(['owner', 'manager']);

function resolveRole(user: User): AppRole | null {
  const rawRole = user.app_metadata?.role;

  if (typeof rawRole !== 'string') {
    return null;
  }

  return KNOWN_ROLES.has(rawRole as AppRole) ? (rawRole as AppRole) : null;
}

/** Maps a Supabase `User` into the app-facing `AuthUser` shape. */
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: resolveRole(user),
  };
}

/**
 * Returns the validated current user, or `null` when unauthenticated.
 * Uses `getUser()` so the token is verified with Supabase Auth.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return toAuthUser(user);
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
export async function getAuthState(): Promise<AuthState> {
  const user = await getCurrentUser();
  return {
    user,
    isAuthenticated: user !== null,
  };
}

/**
 * Future hook for role-based authorization.
 * Returns `null` until roles are assigned in Supabase `app_metadata`.
 */
export async function getCurrentUserRole(): Promise<AppRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}
