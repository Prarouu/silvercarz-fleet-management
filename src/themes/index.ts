import { adminTheme } from './admin';
import { customerTheme } from './customer';
import { portalThemeToCssVars } from './css-vars';
import type { PortalId, PortalThemeDefinition, SemanticColorTokens } from './tokens';
import { vendorTheme } from './vendor';

export { adminTheme } from './admin';
export { customerTheme } from './customer';
export { vendorTheme } from './vendor';
export {
  cssVarsToStyleString,
  portalThemeToCssVars,
  sharedCssVars,
  themeColorsToCssVars,
} from './css-vars';
export {
  PORTAL_IDS,
  borderWidth,
  componentHeight,
  focusRing,
  iconSize,
  iconSizeClass,
  motion,
  opacity,
  radius,
  shadows,
  spacing,
  typography,
  type PortalId,
  type PortalThemeDefinition,
  type SemanticColorTokens,
} from './tokens';

/** Registry of all portal themes. Add new portals here. */
export const portalThemes = {
  admin: adminTheme,
  vendor: vendorTheme,
  customer: customerTheme,
} as const satisfies Record<PortalId, PortalThemeDefinition>;

export function getPortalTheme(portal: PortalId): PortalThemeDefinition {
  return portalThemes[portal];
}

export function resolvePortalColors(
  portal: PortalId,
  colorMode: 'light' | 'dark' = 'light',
): SemanticColorTokens {
  const theme = getPortalTheme(portal);
  if (colorMode === 'dark' && theme.darkColors) {
    return theme.darkColors;
  }
  return theme.colors;
}

export function getPortalCssVars(
  portal: PortalId,
  colorMode: 'light' | 'dark' = 'light',
): Record<string, string> {
  return portalThemeToCssVars(resolvePortalColors(portal, colorMode));
}

export function isPortalId(value: string): value is PortalId {
  return value === 'admin' || value === 'vendor' || value === 'customer';
}
