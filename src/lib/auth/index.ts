import 'server-only';

/**
 * Server entry point for authentication infrastructure.
 *
 * Import session helpers and guards from here in Server Components,
 * Server Actions, and Route Handlers:
 *
 *   import { getCurrentUser, requireAuth, signOut } from '@/lib/auth'
 *
 * Client Components must import shared utilities from specific modules
 * (those files are not `server-only`):
 *
 *   import { toAuthError } from '@/lib/auth/errors'
 *   import { isPublicRoute } from '@/lib/auth/route-guards'
 *   import type { AuthUser } from '@/lib/auth/types'
 */

export {
  AUTH_ERROR_CODES,
  createForbiddenError,
  createUnauthenticatedError,
  getAuthErrorMessage,
  toAuthError,
  type AuthErrorCode,
} from './errors';

export {
  buildLoginRedirectPath,
  isAuthCallbackRoute,
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
  resolvePostLoginPath,
} from './route-guards';

export { requireAuth, requireUser } from './require-auth';

export {
  getAuthState,
  getCurrentSession,
  getCurrentUser,
  getCurrentUserRole,
  isAuthenticated,
  toAuthUser,
} from './session';

export { signOut } from './sign-out';

export type { AppRole, AuthState, AuthUser } from './types';
