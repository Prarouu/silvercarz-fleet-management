import { STORAGE_KEYS } from './storage';

/**
 * Theme-related constants shared by providers and hooks.
 */
export const THEME = {
  light: 'light',
  dark: 'dark',
  system: 'system',
  defaultTheme: 'light',
  storageKey: STORAGE_KEYS.theme,
} as const;

export type ThemeMode = (typeof THEME)['light'] | (typeof THEME)['dark'] | (typeof THEME)['system'];
