import { STORAGE_KEYS } from './storage';

/**
 * Color-mode constants (light / dark / system) shared by providers and hooks.
 * Portal identity (admin / vendor / customer) lives in `@/config/portal`
 * and `@/themes`.
 */
export const THEME = {
  light: 'light',
  dark: 'dark',
  system: 'system',
  defaultTheme: 'light',
  storageKey: STORAGE_KEYS.theme,
  /** data-attribute on `<html>` that selects the portal palette. */
  portalAttribute: 'data-portal',
} as const;

export type ThemeMode = (typeof THEME)['light'] | (typeof THEME)['dark'] | (typeof THEME)['system'];
