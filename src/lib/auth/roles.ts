/**
 * Application roles.
 *
 * Source of truth in Postgres is `public.app_role` / `profiles.role`.
 * Add new roles here and in the SQL enum together.
 */

export const APP_ROLES = {
  owner: 'owner',
  manager: 'manager',
  customer: 'customer',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Ordered list — useful for selects and future role hierarchies. */
export const APP_ROLE_VALUES = [APP_ROLES.owner, APP_ROLES.manager, APP_ROLES.customer] as const;

/** Staff roles that may access the Admin Portal. */
export const STAFF_ROLES = [APP_ROLES.owner, APP_ROLES.manager] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

const APP_ROLE_SET = new Set<string>(APP_ROLE_VALUES);
const STAFF_ROLE_SET = new Set<string>(STAFF_ROLES);

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLE_SET.has(value);
}

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && STAFF_ROLE_SET.has(value);
}

/** Human-readable labels for UI (menus, badges). */
export const APP_ROLE_LABELS: Record<AppRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  customer: 'Customer',
};
