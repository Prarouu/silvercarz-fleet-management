/**
 * Route classification helpers for authentication and authorization.
 *
 * Path strings come from `ROUTES` — never hardcode auth paths at call sites.
 * Proxy and layouts use these helpers to decide public vs protected access.
 *
 * ---------------------------------------------------------------------------
 * Customer / Admin coexistence (architecture — C0)
 * ---------------------------------------------------------------------------
 * - One Supabase Auth project serves both portals.
 * - Admin staff (`owner` | `manager`) use `/admin/login` and `/admin/*`.
 * - Future customers will use `/login` + `/signup` and customer account routes.
 * - `isProtectedRoute` remains **admin-only**. Customer account protection
 *   will be added in a later phase via `isCustomerProtectedRoute` — do not
 *   redirect customers to the admin login.
 * - A future `customer` app_role (DB migration) is required before customer
 *   auth can land. C0 intentionally makes **zero schema changes**.
 */

import { ROUTES, type AppRoute } from '@/constants/routes';
import type { AppRole } from '@/lib/auth/roles';

/** Auth-facing routes that must stay reachable without a session. */
const PUBLIC_AUTH_ROUTES: readonly AppRoute[] = [
  ROUTES.login,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.customerLogin,
  ROUTES.customerSignup,
] as const;

/** Prefix for Auth callback / confirmation handlers (e.g. `/auth/callback`). */
const AUTH_CALLBACK_PREFIX = '/auth';

/** Admin portal URL prefix. */
const ADMIN_PREFIX = ROUTES.admin;

/**
 * Customer account routes that will require a customer session later.
 * Kept public in C0 (placeholders only — no auth gate yet).
 */
const CUSTOMER_ACCOUNT_ROUTES: readonly AppRoute[] = [ROUTES.myBookings, ROUTES.profile] as const;

/** How a route may be accessed. Extend with `permission` when needed. */
export type RouteAccess =
  | { readonly type: 'public' }
  | { readonly type: 'authenticated' }
  | { readonly type: 'roles'; readonly roles: readonly AppRole[] };

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** True for paths under the admin portal (`/admin`, `/admin/...`). */
export function isAdminRoute(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`);
}

/** True for login, password-reset, and related auth screens (admin or customer). */
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
 * True for customer account surfaces that will require a customer session.
 * Not enforced in C0 — classification only.
 */
export function isCustomerAccountRoute(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return CUSTOMER_ACCOUNT_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/**
 * Future customer session gate. Always `false` in C0 so placeholders stay public.
 * A later phase will return true for account + in-progress booking request steps.
 */
export function isCustomerProtectedRoute(_pathname: string): boolean {
  return false;
}

/**
 * Admin routes that require a session.
 * Public site paths and admin auth screens are not protected.
 */
export function isProtectedRoute(pathname: string): boolean {
  return isAdminRoute(pathname) && !isAuthRoute(pathname) && !isAuthCallbackRoute(pathname);
}

/** Inverse of `isProtectedRoute`. */
export function isPublicRoute(pathname: string): boolean {
  return !isProtectedRoute(pathname);
}

/**
 * Default access rule for a pathname.
 * Role-specific maps can be added later without changing call sites.
 */
export function getRouteAccess(pathname: string): RouteAccess {
  if (isPublicRoute(pathname)) {
    return { type: 'public' };
  }

  return { type: 'authenticated' };
}

/**
 * Evaluates whether `role` satisfies a route access rule.
 * `null` role fails authenticated / role-restricted rules.
 */
export function allowsRouteAccess(access: RouteAccess, role: AppRole | null): boolean {
  switch (access.type) {
    case 'public':
      return true;
    case 'authenticated':
      return role !== null;
    case 'roles':
      return role !== null && access.roles.includes(role);
    default: {
      const _exhaustive: never = access;
      return _exhaustive;
    }
  }
}

/**
 * Builds an admin login URL that preserves the intended destination.
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
 * Future customer login redirect. Ready for the customer auth phase —
 * not wired into Proxy in C0.
 */
export function buildCustomerLoginRedirectPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return ROUTES.customerLogin;
  }

  const params = new URLSearchParams({ next: nextPath });
  return `${ROUTES.customerLogin}?${params.toString()}`;
}

/**
 * Safe post-login destination. Rejects open redirects by requiring a
 * same-origin relative path under a protected admin route.
 */
export function resolvePostLoginPath(nextPath: string | null | undefined): AppRoute | string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return ROUTES.dashboard;
  }

  if (!isProtectedRoute(nextPath)) {
    return ROUTES.dashboard;
  }

  return nextPath;
}
