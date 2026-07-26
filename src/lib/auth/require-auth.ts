import 'server-only';

/**
 * Authentication and authorization guards for Server Components / Actions.
 *
 * - `requireUser` / `requireRole` / `requirePermission` throw typed errors
 * - `requireAuth` redirects to login (page / layout boundaries)
 */

import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { can, hasRole } from '@/lib/auth/authorization';
import {
  AUTH_ERROR_CODES,
  createForbiddenError,
  createInactiveAccountError,
  createUnauthenticatedError,
} from '@/lib/auth/errors';
import type { Permission } from '@/lib/auth/permissions';
import { ensureCurrentProfile, toAuthUserFromProfile } from '@/lib/auth/profile';
import type { AppRole } from '@/lib/auth/roles';
import { getAuthState } from '@/lib/auth/session';
import { signOut } from '@/lib/auth/sign-out';
import type { AuthUser, UserProfile } from '@/lib/auth/types';
import { AppError } from '@/lib/errors';

function buildLoginRedirect(nextPath?: string, reason?: string): string {
  const loginUrl = new URL(ROUTES.login, 'http://localhost');

  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    loginUrl.searchParams.set('next', nextPath);
  }

  if (reason) {
    loginUrl.searchParams.set('reason', reason);
  }

  return `${loginUrl.pathname}${loginUrl.search}`;
}

/**
 * Loads the current profile or throws a typed auth error.
 * Use in Server Actions / services that should fail closed.
 */
export async function requireProfile(): Promise<UserProfile> {
  const { user, profile } = await getAuthState();

  if (!user) {
    throw createUnauthenticatedError();
  }

  const resolved = profile ?? (await ensureCurrentProfile());

  if (!resolved.isActive) {
    throw createInactiveAccountError();
  }

  return resolved;
}

/**
 * Returns the current user or throws an unauthenticated `AppError`.
 * Ensures an active profile exists (role comes from `profiles`).
 */
export async function requireUser(): Promise<AuthUser> {
  const profile = await requireProfile();
  return toAuthUserFromProfile(profile);
}

/**
 * Returns the current user or redirects to the login page.
 * Use in Server Components / layouts that gate rendered UI.
 *
 * Signs out before redirecting when the profile is missing or inactive so
 * the proxy does not bounce the user between `/login` and the app shell.
 */
export async function requireAuth(nextPath?: string): Promise<AuthUser> {
  const { user, profile } = await getAuthState();

  if (!user) {
    redirect(buildLoginRedirect(nextPath));
  }

  let resolved = profile;

  if (!resolved) {
    try {
      resolved = await ensureCurrentProfile();
    } catch (error) {
      await signOut().catch(() => undefined);
      const reason =
        error instanceof AppError && error.code === AUTH_ERROR_CODES.databaseSetupRequired
          ? AUTH_ERROR_CODES.databaseSetupRequired
          : AUTH_ERROR_CODES.missingProfile;
      redirect(buildLoginRedirect(nextPath, reason));
    }
  }

  if (!resolved.isActive) {
    await signOut().catch(() => undefined);
    redirect(buildLoginRedirect(nextPath, AUTH_ERROR_CODES.inactiveAccount));
  }

  return toAuthUserFromProfile(resolved);
}

/**
 * Ensures the current user has one of `allowedRoles`.
 * Throws forbidden / auth errors — use in Server Actions and services.
 */
export async function requireRole(...allowedRoles: AppRole[]): Promise<AuthUser> {
  const profile = await requireProfile();

  if (!hasRole(profile, allowedRoles)) {
    throw createForbiddenError();
  }

  return toAuthUserFromProfile(profile);
}

/**
 * Ensures the current user is granted `permission`.
 * Throws forbidden / auth errors — prefer this over scattered role checks.
 */
export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const profile = await requireProfile();

  if (!can(profile, permission)) {
    throw createForbiddenError();
  }

  return toAuthUserFromProfile(profile);
}
