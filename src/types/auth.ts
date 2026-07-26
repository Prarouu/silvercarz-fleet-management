/**
 * Shared auth domain types.
 *
 * Canonical definitions live in `@/lib/auth/types` and `@/lib/auth/roles`.
 * This module re-exports them so feature code can import auth models from
 * `@/types` alongside booking/vehicle models without duplicating interfaces.
 *
 * For `UserRole` / role constants, prefer `@/types/enums` (or `@/lib/auth/roles`).
 */

export type {
  AuthState,
  AuthUser,
  AuthUser as AuthenticatedUser,
  UserProfile,
} from '@/lib/auth/types';

export type { AppRole } from '@/lib/auth/roles';

export { APP_ROLES, APP_ROLE_LABELS, APP_ROLE_VALUES, isAppRole } from '@/lib/auth/roles';
