import 'server-only';

/**
 * Authentication guards for Server Components and Server Actions.
 *
 * `requireUser` throws a typed error (service/action boundaries).
 * `requireAuth` redirects to the login route (page/layout boundaries).
 */

import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { createUnauthenticatedError } from '@/lib/auth/errors';
import { getCurrentUser } from '@/lib/auth/session';
import type { AuthUser } from '@/lib/auth/types';

/**
 * Returns the current user or throws an unauthenticated `AppError`.
 * Use in Server Actions and services that should fail closed.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw createUnauthenticatedError();
  }

  return user;
}

/**
 * Returns the current user or redirects to the login page.
 * Use in Server Components / layouts that gate rendered UI.
 *
 * `next` is preserved as a query param for post-login return navigation.
 */
export async function requireAuth(nextPath?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = new URL(ROUTES.login, 'http://localhost');
    if (nextPath && nextPath.startsWith('/')) {
      loginUrl.searchParams.set('next', nextPath);
    }
    redirect(`${loginUrl.pathname}${loginUrl.search}`);
  }

  return user;
}
