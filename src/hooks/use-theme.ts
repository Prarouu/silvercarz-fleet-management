'use client';

import { useTheme as useNextTheme } from 'next-themes';

import { usePortalTheme } from '@/providers/theme-provider';

/**
 * Color-mode hook (`light` / `dark` / `system`) wrapped so features depend
 * on our surface rather than `next-themes` directly.
 */
export function useTheme() {
  return useNextTheme();
}

/**
 * Active portal theme (Admin / Vendor / Customer) from configuration.
 */
export function usePortalThemeMode() {
  return usePortalTheme();
}
