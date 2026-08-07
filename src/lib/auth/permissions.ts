/**
 * Centralized permission matrix for role-based authorization.
 *
 * Owner and Manager currently share full access. Future modules should call
 * `hasPermission` / `requirePermission` instead of hardcoding role checks
 * throughout the app — extend `PERMISSIONS` and `ROLE_PERMISSIONS` here.
 */

import { APP_ROLES, type AppRole } from '@/lib/auth/roles';

/**
 * Named permissions. Add domain permissions as modules land
 * (e.g. `bookings:write`) without scattering string literals.
 */
export const PERMISSIONS = {
  /** Access the authenticated application shell. */
  appAccess: 'app:access',
  /** Read staff profiles (future user management lists). */
  profilesRead: 'profiles:read',
  /** Change roles / active status (future admin only). */
  profilesManage: 'profiles:manage',
  /** Read bookings (list, search, detail). */
  bookingsRead: 'bookings:read',
  /** Create and update bookings. */
  bookingsWrite: 'bookings:write',
  /** Soft-delete / permanently delete bookings. */
  bookingsDelete: 'bookings:delete',
  /** Read vehicles (list, search, detail). */
  vehiclesRead: 'vehicles:read',
  /** Create and update vehicles. */
  vehiclesWrite: 'vehicles:write',
  /** Soft-delete / permanently delete vehicles. */
  vehiclesDelete: 'vehicles:delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role → permission grants.
 * `'all'` means every permission in `PERMISSIONS` (and future ones until
 * this map is narrowed). Prefer `'all'` only while roles are equivalent.
 */
type RoleGrant = 'all' | readonly Permission[];

const ROLE_PERMISSIONS: Record<AppRole, RoleGrant> = {
  [APP_ROLES.owner]: 'all',
  [APP_ROLES.manager]: 'all',
  /** Customers never receive Admin Portal permissions. */
  [APP_ROLES.customer]: [],
};

/** Returns true when `role` is granted `permission`. */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  const grant = ROLE_PERMISSIONS[role];

  if (grant === 'all') {
    return true;
  }

  return grant.includes(permission);
}

/** Lists effective permissions for a role (resolves `'all'`). */
export function getPermissionsForRole(role: AppRole): readonly Permission[] {
  const grant = ROLE_PERMISSIONS[role];

  if (grant === 'all') {
    return Object.values(PERMISSIONS);
  }

  return grant;
}
