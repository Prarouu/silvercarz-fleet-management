import type { PortalId } from '@/themes';

/**
 * Active portal theme for this Next.js app instance.
 *
 * Switch portals by configuration — never hardcode theme selection
 * inside reusable UI components.
 *
 * Future Vendor / Customer apps set this to `'vendor'` / `'customer'`.
 */
export const portalConfig = {
  /** Which portal visual identity this deployment uses. */
  theme: 'admin' as PortalId,
} as const;

export type PortalConfig = typeof portalConfig;
