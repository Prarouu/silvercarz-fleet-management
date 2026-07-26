'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { portalConfig } from '@/config';
import { THEME } from '@/constants';
import { getPortalTheme, type PortalId, type PortalThemeDefinition } from '@/themes';

type NextThemesProviderProps = ComponentProps<typeof NextThemesProvider>;

type PortalThemeContextValue = {
  portal: PortalId;
  portalTheme: PortalThemeDefinition;
};

const PortalThemeContext = createContext<PortalThemeContextValue | null>(null);

/**
 * Keeps `data-portal` on `<html>` aligned with configuration.
 * Palette values resolve from CSS (`globals.css`) for zero runtime cost.
 */
function PortalAttributeSync({ portal }: { portal: PortalId }) {
  useEffect(() => {
    document.documentElement.setAttribute(THEME.portalAttribute, portal);
  }, [portal]);

  return null;
}

export type ThemeProviderProps = Omit<NextThemesProviderProps, 'children'> & {
  children: ReactNode;
  /** Override portal for tests or multi-app shells. Defaults to `portalConfig.theme`. */
  portal?: PortalId;
};

/**
 * Portal-aware theme provider.
 *
 * - `portal` selects Admin / Vendor / Customer design tokens (config-driven)
 * - `next-themes` handles light / dark / system color mode within that portal
 *
 * Components must never hardcode a portal theme — read `portalConfig` /
 * `usePortalTheme()` instead.
 */
export function ThemeProvider({
  children,
  portal = portalConfig.theme,
  ...props
}: ThemeProviderProps) {
  const portalTheme = getPortalTheme(portal);
  const value = useMemo(
    () => ({
      portal,
      portalTheme,
    }),
    [portal, portalTheme],
  );

  return (
    <PortalThemeContext.Provider value={value}>
      <NextThemesProvider {...props}>
        <PortalAttributeSync portal={portal} />
        {children}
      </NextThemesProvider>
    </PortalThemeContext.Provider>
  );
}

/** Access the active portal theme definition (Admin / Vendor / Customer). */
export function usePortalTheme(): PortalThemeContextValue {
  const context = useContext(PortalThemeContext);
  if (!context) {
    throw new Error('usePortalTheme must be used within ThemeProvider.');
  }
  return context;
}
