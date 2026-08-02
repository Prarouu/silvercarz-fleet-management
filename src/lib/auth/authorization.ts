/**
 * Pure authorization helpers (no I/O).
 *
 * Use these for role / permission checks once a role is known.
 * Server guards that load the session live in `require-auth.ts`.
 */

import { hasPermission, type Permission } from '@/lib/auth/permissions';
import { APP_ROLES, STAFF_ROLES, type AppRole } from '@/lib/auth/roles';
import type { AuthUser, UserProfile } from '@/lib/auth/types';

type RoleBearer = AppRole | AuthUser | UserProfile | null | undefined;

function resolveRole(value: RoleBearer): AppRole | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.role;
}

/** True when the bearer has one of the allowed roles. */
export function hasRole(value: RoleBearer, allowed: readonly AppRole[]): boolean {
  const role = resolveRole(value);
  return role !== null && allowed.includes(role);
}

export function isOwner(value: RoleBearer): boolean {
  return resolveRole(value) === APP_ROLES.owner;
}

export function isManager(value: RoleBearer): boolean {
  return resolveRole(value) === APP_ROLES.manager;
}

export function isCustomer(value: RoleBearer): boolean {
  return resolveRole(value) === APP_ROLES.customer;
}

/** True for Admin Portal staff (`owner` | `manager`). */
export function isStaff(value: RoleBearer): boolean {
  return hasRole(value, STAFF_ROLES);
}

/** True when the bearer is granted the named permission. */
export function can(value: RoleBearer, permission: Permission): boolean {
  const role = resolveRole(value);
  return role !== null && hasPermission(role, permission);
}
