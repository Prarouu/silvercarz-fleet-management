/**
 * Design-system token contracts and shared (non-color) scales.
 *
 * Color values live in portal presets (`admin.ts`, `vendor.ts`, `customer.ts`).
 * Components must consume semantic CSS variables / Tailwind theme tokens —
 * never raw hex values.
 */

export const PORTAL_IDS = ['admin', 'vendor', 'customer'] as const;

export type PortalId = (typeof PORTAL_IDS)[number];

/** Semantic color tokens every portal must define. */
export interface SemanticColorTokens {
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  surfaceSecondary: string;
  surfaceSecondaryForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
  info: string;
  infoForeground: string;
  border: string;
  input: string;
  ring: string;
  overlay: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  tableHeader: string;
  tableBorder: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface PortalThemeDefinition {
  id: PortalId;
  name: string;
  description: string;
  colors: SemanticColorTokens;
  /** Optional dark-mode palette when the portal supports color-mode toggling. */
  darkColors?: SemanticColorTokens;
}

/** Spacing scale (rem). Prefer Tailwind spacing utilities mapped to this scale. */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

/** Border-radius scale. */
export const radius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '0.875rem',
  '2xl': '1.125rem',
  full: '9999px',
  /** Base radius used by shadcn `--radius`. */
  base: '0.625rem',
} as const;

/** Elevation / shadow tokens. */
export const shadows = {
  none: 'none',
  card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
  dropdown: '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
  dialog: '0 16px 40px -12px rgb(0 0 0 / 0.16), 0 4px 12px -4px rgb(0 0 0 / 0.08)',
  popover: '0 8px 24px -6px rgb(0 0 0 / 0.1), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
} as const;

/** Typography roles — sizes/line-heights for consistent hierarchy. */
export const typography = {
  display: { size: '2.25rem', lineHeight: '2.5rem', weight: '600' },
  heading: { size: '1.5rem', lineHeight: '2rem', weight: '600' },
  subheading: { size: '1.125rem', lineHeight: '1.75rem', weight: '600' },
  body: { size: '0.875rem', lineHeight: '1.25rem', weight: '400' },
  caption: { size: '0.75rem', lineHeight: '1rem', weight: '400' },
  small: { size: '0.75rem', lineHeight: '1rem', weight: '400' },
  label: { size: '0.875rem', lineHeight: '1.25rem', weight: '500' },
  helper: { size: '0.75rem', lineHeight: '1rem', weight: '400' },
} as const;

/** Icon size tokens (Tailwind `size-*` equivalents). */
export const iconSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
} as const;

/** Tailwind class helpers for icon sizing — prefer these over arbitrary values. */
export const iconSizeClass = {
  xs: 'size-3',
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
} as const;

/** Transition / motion tokens. */
export const motion = {
  fast: '100ms',
  normal: '150ms',
  slow: '250ms',
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/** Interactive control heights. */
export const componentHeight = {
  xs: '1.5rem',
  sm: '1.75rem',
  md: '2rem',
  lg: '2.25rem',
  xl: '2.5rem',
} as const;

/** Border widths. */
export const borderWidth = {
  none: '0',
  default: '1px',
  thick: '2px',
} as const;

/** Focus ring. */
export const focusRing = {
  width: '3px',
  offset: '0px',
  opacity: '0.5',
} as const;

/** Shared opacity steps. */
export const opacity = {
  disabled: '0.5',
  hover: '0.8',
  muted: '0.6',
  overlay: '0.4',
} as const;
