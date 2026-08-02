import type { PortalId } from '@/themes';

/**
 * Default portal theme for the root HTML attribute / ThemeProvider SSR fallback.
 *
 * Route groups override the active portal via `PortalThemeScope`:
 * - Customer routes (`(customer)`) → `'customer'`
 * - Admin routes (`/admin`) → `'admin'`
 *
 * Never hardcode portal selection inside reusable UI components.
 */
export const portalConfig = {
  /** SSR / provider default. Overridden per route group at runtime. */
  theme: 'admin' as PortalId,
} as const;

export type PortalConfig = typeof portalConfig;
