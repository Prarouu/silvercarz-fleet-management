/**
 * Route classification helpers for authentication.
 *
 * Path strings come from `ROUTES` — never hardcode auth paths at call sites.
 * Proxy and future layouts use these helpers to decide public vs protected.
 */

import { ROUTES, type AppRoute } from '@/constants/routes';

/** Auth-facing routes that must stay reachable without a session. */
const PUBLIC_AUTH_ROUTES: readonly AppRoute[] = [
  ROUTES.login,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
] as const;

/** Prefix for Auth callback / confirmation handlers (e.g. `/auth/callback`). */
const AUTH_CALLBACK_PREFIX = '/auth';

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** True for login, password-reset, and related auth screens. */
export function isAuthRoute(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return PUBLIC_AUTH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/** True for Supabase Auth callback / confirmation paths under `/auth`. */
export function isAuthCallbackRoute(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === AUTH_CALLBACK_PREFIX || path.startsWith(`${AUTH_CALLBACK_PREFIX}/`);
}

/**
 * Routes that do not require an authenticated session.
 * Everything else is treated as protected once enforcement is enabled.
 */
export function isPublicRoute(pathname: string): boolean {
  return isAuthRoute(pathname) || isAuthCallbackRoute(pathname);
}

/** Inverse of `isPublicRoute` — prepared for proxy / layout guards. */
export function isProtectedRoute(pathname: string): boolean {
  return !isPublicRoute(pathname);
}

/**
 * Builds a login URL that preserves the intended destination.
 * Used when redirecting unauthenticated users (login UI phase).
 */
export function buildLoginRedirectPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return ROUTES.login;
  }

  const params = new URLSearchParams({ next: nextPath });
  return `${ROUTES.login}?${params.toString()}`;
}

/**
 * Safe post-login destination. Rejects open redirects by requiring a
 * same-origin relative path.
 */
export function resolvePostLoginPath(nextPath: string | null | undefined): AppRoute | string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return ROUTES.home;
  }

  if (isAuthRoute(nextPath) || isAuthCallbackRoute(nextPath)) {
    return ROUTES.home;
  }

  return nextPath;
}
