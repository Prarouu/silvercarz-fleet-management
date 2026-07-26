/**
 * Application roles.
 *
 * Source of truth in Postgres is `public.app_role` / `profiles.role`.
 * Add new roles here and in the SQL enum together.
 */

export const APP_ROLES = {
  owner: 'owner',
  manager: 'manager',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Ordered list — useful for selects and future role hierarchies. */
export const APP_ROLE_VALUES = [APP_ROLES.owner, APP_ROLES.manager] as const;

const APP_ROLE_SET = new Set<string>(APP_ROLE_VALUES);

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLE_SET.has(value);
}

/** Human-readable labels for UI (menus, badges). */
export const APP_ROLE_LABELS: Record<AppRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
};
