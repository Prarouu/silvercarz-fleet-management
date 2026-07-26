'use client';

import { useTheme as useNextTheme } from 'next-themes';

/**
 * Thin wrapper around `next-themes` so feature modules depend on our hook
 * surface rather than the library directly.
 */
export function useTheme() {
  return useNextTheme();
}
