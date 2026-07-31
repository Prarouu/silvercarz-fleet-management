import { radius, shadows } from './tokens';
import type { SemanticColorTokens } from './tokens';

/**
 * Maps semantic color tokens → CSS custom properties consumed by
 * `globals.css` / Tailwind `@theme inline` and shadcn components.
 */
export function themeColorsToCssVars(colors: SemanticColorTokens): Record<string, string> {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.surface,
    '--card-foreground': colors.surfaceForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.danger,
    '--destructive-foreground': colors.dangerForeground,
    '--success': colors.success,
    '--success-foreground': colors.successForeground,
    '--warning': colors.warning,
    '--warning-foreground': colors.warningForeground,
    '--info': colors.info,
    '--info-foreground': colors.infoForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    '--overlay': colors.overlay,
    '--sidebar': colors.sidebar,
    '--sidebar-foreground': colors.sidebarForeground,
    '--sidebar-primary': colors.sidebarPrimary,
    '--sidebar-primary-foreground': colors.sidebarPrimaryForeground,
    '--sidebar-accent': colors.sidebarAccent,
    '--sidebar-accent-foreground': colors.sidebarAccentForeground,
    '--sidebar-border': colors.sidebarBorder,
    '--sidebar-ring': colors.sidebarRing,
    '--table-header': colors.tableHeader,
    '--table-border': colors.tableBorder,
    '--chart-1': colors.chart1,
    '--chart-2': colors.chart2,
    '--chart-3': colors.chart3,
    '--chart-4': colors.chart4,
    '--chart-5': colors.chart5,
    /* Surface aliases for explicit semantic usage */
    '--surface': colors.surface,
    '--surface-foreground': colors.surfaceForeground,
    '--surface-secondary': colors.surfaceSecondary,
    '--surface-secondary-foreground': colors.surfaceSecondaryForeground,
    /* Metric / accent tone surfaces (design language) */
    '--tone-gold': colors.toneGold,
    '--tone-gold-foreground': colors.toneGoldForeground,
    '--tone-mint': colors.toneMint,
    '--tone-mint-foreground': colors.toneMintForeground,
    '--tone-lavender': colors.toneLavender,
    '--tone-lavender-foreground': colors.toneLavenderForeground,
    '--tone-ink': colors.toneInk,
    '--tone-ink-foreground': colors.toneInkForeground,
  };
}

/** Shared non-color CSS variables (radius, shadows). */
export function sharedCssVars(): Record<string, string> {
  return {
    '--radius': radius.base,
    '--elevation-card': shadows.card,
    '--elevation-dropdown': shadows.dropdown,
    '--elevation-dialog': shadows.dialog,
    '--elevation-popover': shadows.popover,
  };
}

/** Flatten portal color + shared vars for inline `style` / `documentElement`. */
export function portalThemeToCssVars(colors: SemanticColorTokens): Record<string, string> {
  return {
    ...sharedCssVars(),
    ...themeColorsToCssVars(colors),
  };
}

/** Serialize CSS vars for a `<style>` tag or SSR inline style string. */
export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}
