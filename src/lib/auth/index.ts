import 'server-only';

/**
 * Server entry point for authentication and authorization infrastructure.
 *
 * Import session helpers and guards from here in Server Components,
 * Server Actions, and Route Handlers:
 *
 *   import { getCurrentUser, requireAuth, requireRole, signOut } from '@/lib/auth'
 *
 * Client Components must import shared utilities from specific modules
 * (those files are not `server-only`):
 *
 *   import { toAuthError } from '@/lib/auth/errors'
 *   import { isPublicRoute } from '@/lib/auth/route-guards'
 *   import { hasRole, isOwner } from '@/lib/auth/authorization'
 *   import type { AuthUser, UserProfile } from '@/lib/auth/types'
 */

export { can, hasRole, isManager, isOwner } from './authorization';

export {
  AUTH_ERROR_CODES,
  createForbiddenError,
  createInactiveAccountError,
  createMissingProfileError,
  createSessionExpiredError,
  createUnauthenticatedError,
  getAuthErrorMessage,
  getAuthErrorMessageForCode,
  toAuthError,
  type AuthErrorCode,
} from './errors';

export { getPermissionsForRole, hasPermission, PERMISSIONS, type Permission } from './permissions';

export {
  createDatabaseSetupRequiredError,
  ensureCurrentProfile,
  getCurrentProfile,
  getProfileById,
  toAuthUserFromProfile,
  toUserProfile,
} from './profile';

export {
  requireAuth,
  requirePermission,
  requireProfile,
  requireRole,
  requireUser,
} from './require-auth';

export { APP_ROLE_LABELS, APP_ROLE_VALUES, APP_ROLES, isAppRole, type AppRole } from './roles';

export {
  allowsRouteAccess,
  buildLoginRedirectPath,
  getRouteAccess,
  isAuthCallbackRoute,
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
  resolvePostLoginPath,
  type RouteAccess,
} from './route-guards';

export {
  getAuthState,
  getCurrentSession,
  getCurrentUser,
  getCurrentUserRole,
  isAuthenticated,
  toAuthUser,
} from './session';

export { signOut } from './sign-out';

export type { AuthState, AuthUser, UserProfile } from './types';
