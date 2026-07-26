'use client';

import type { ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { THEME } from '@/constants';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

/**
 * Root client provider composition.
 *
 * Add future cross-cutting providers here (e.g. auth) instead of nesting
 * them ad hoc in `app/layout.tsx`.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={THEME.defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey={THEME.storageKey}
    >
      <QueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
