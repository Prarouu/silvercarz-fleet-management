# Design System — Multi-Portal Theme Architecture

Phase 4.6 introduces a token-driven design system so Admin, Vendor, and Customer
portals can share one component library while keeping independent visual
identities.

## Visual language (Admin)

Silver Carz Admin keeps the original brand palette (`#F4B400` primary on light
`#FAFAFA` / dark `#0F1115`) and applies a soft-squircle metric language:

| Pattern        | Implementation                                                 |
| -------------- | -------------------------------------------------------------- |
| Soft squircles | Cards / panels use `rounded-3xl`; controls use `rounded-xl`    |
| Metric tones   | `tone-gold`, `tone-mint`, `tone-lavender`, `tone-ink` surfaces |
| Icon wells     | `IconWell` — small `rounded-lg` squares, contrasting fill      |
| Metric labels  | `.text-metric` — uppercase, tracked                            |
| Metric values  | `.text-metric-value` — large, bold, tabular                    |
| Status pills   | `Badge` with `rounded-full` outline / soft fills               |

Shared composites:

- `MetricCard` — icon well + optional pill + label + value
- `IconWell` — reusable squared icon container

Prefer these over one-off KPI layouts in features.

## Goals

- One component library for every portal
- Portal identity switched by **configuration**, not by rewriting UI
- No hardcoded colors in reusable components
- Lightweight theming (CSS variables + `data-portal`) with no runtime overhead

## Folder structure

```
src/
├── themes/
│   ├── tokens.ts          # Token contracts + shared scales
│   ├── css-vars.ts        # Semantic tokens → CSS custom properties
│   ├── admin.ts           # Admin portal preset
│   ├── vendor.ts          # Vendor portal preset (future)
│   ├── customer.ts        # Customer portal preset (yellow / black / white)
│   └── index.ts           # Registry + helpers
├── config/
│   └── portal.ts          # Active portal (`theme: 'admin'`)
├── providers/
│   └── theme-provider.tsx # Portal + color-mode provider
├── components/shared/
│   ├── metric-card.tsx    # Soft-squircle metric surfaces
│   └── icon-well.tsx      # Squared icon container
└── app/
    └── globals.css        # CSS variable themes + Tailwind bridge
```

## Design token system

### Semantic color tokens

Reusable UI consumes **semantic** names only:

| Token                                                | Role                     |
| ---------------------------------------------------- | ------------------------ |
| `background`                                         | Page canvas              |
| `surface` / `card`                                   | Panels, cards            |
| `surfaceSecondary` / `muted`                         | Subtle fills             |
| `foreground` / `mutedForeground`                     | Primary / secondary text |
| `primary` / `primaryForeground`                      | Brand actions            |
| `secondary`, `accent`                                | Supporting fills         |
| `success`, `warning`, `danger`, `info`               | Status                   |
| `toneGold` / `toneMint` / `toneLavender` / `toneInk` | Metric accent surfaces   |
| `border`, `input`, `ring`                            | Edges + focus            |
| `overlay`                                            | Modal scrims             |
| `sidebar*`                                           | Shell navigation         |
| `tableHeader`, `tableBorder`                         | Data tables              |

In components, prefer Tailwind utilities mapped to those tokens:

```tsx
<div className="bg-background text-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<div className="bg-tone-mint text-tone-mint-foreground" />
```

Never use raw hex / `bg-black` / `text-white` inside `@/components/ui` or
`@/components/shared`.

### Shared non-color scales

Defined once in `src/themes/tokens.ts`:

- **Spacing** — `spacing`
- **Radius** — `radius` (`sm` … `2xl`, `base` = `1rem` for squircles)
- **Shadows** — `shadows.card|dropdown|dialog|popover` → `shadow-card`, etc.
- **Typography roles** — `typography` + utilities `.text-display|heading|subheading|body|caption|label|helper|metric|metric-value`
- **Icon sizes** — `iconSize` / `iconSizeClass` (`xs` … `xl`)
- **Motion**, **component heights**, **border widths**, **focus ring**, **opacity**

## Theme architecture

Two axes:

1. **Portal theme** — Admin / Vendor / Customer (visual identity)
2. **Color mode** — light / dark / system (`next-themes`, class strategy)

Portal themes live in TypeScript presets and are mirrored as CSS under
`[data-portal='…']` in `globals.css` for SSR and first paint.

```
<html data-portal="admin" class="dark?">
  CSS variables resolve from portal + color mode
  Tailwind utilities read those variables via @theme inline
```

### Portal presets

| Portal       | Purpose        | Primary                   | Canvas                           |
| ------------ | -------------- | ------------------------- | -------------------------------- |
| **Admin**    | Internal SaaS  | `#F4B400` (yellow accent) | Light `#FAFAFA` / white surfaces |
| **Vendor**   | Partner owners | `#2563EB`                 | Light `#F8FAFC`                  |
| **Customer** | Marketing site | `#F4B400` + `#FFD54A`     | Dark `#111111`                   |

Customer and Vendor presets are ready for future apps. They do **not** affect
the current Admin deployment.

## Theme switching

### Active portal (configuration)

```ts
// src/config/portal.ts
export const portalConfig = {
  theme: 'admin', // 'vendor' | 'customer' for future apps
} as const;
```

`AppProviders` passes this into `ThemeProvider`. The root layout sets
`data-portal={portalConfig.theme}` for SSR.

To stand up a Vendor app later: set `portalConfig.theme = 'vendor'` (or inject
via env) — shared components pick up the blue palette automatically.

### Color mode (user preference)

Existing `ThemeToggle` + `useTheme()` still control light / dark / system.
Admin and Vendor define optional `darkColors`; Customer is inherently dark.

```ts
import { useTheme, usePortalThemeMode } from '@/hooks';

const { theme, setTheme } = useTheme(); // light | dark | system
const { portal, portalTheme } = usePortalThemeMode();
```

Do **not** hardcode portal selection inside feature components.

## Portal strategy

| Concern           | Approach                    |
| ----------------- | --------------------------- |
| Shared primitives | `@/components/ui` (shadcn)  |
| Shared composites | `@/components/shared`       |
| App shell         | `@/components/layout`       |
| Domain UI         | `@/features/*`              |
| Visual identity   | `@/themes` + `portalConfig` |

Future portals should:

1. Reuse the same UI packages
2. Set `portalConfig.theme`
3. Add route groups / apps as needed
4. Avoid forking Button / Card / Table

## Component guidelines

1. **Tokens only** — colors, radii, shadows, overlays via semantic utilities.
2. **No portal branches in UI** — `if (portal === 'customer')` belongs in app
   composition, not in `Button`.
3. **Typography roles** — prefer `.text-heading`, `.text-body`, `.text-metric`
   over ad-hoc sizes on shared surfaces.
4. **Icons** — use `IconWell` + `iconSizeClass` from `@/themes`.
5. **Status** — use `Badge` / `Alert` variants: `success`, `warning`, `info`,
   `destructive`.
6. **Elevation** — `shadow-card`, `shadow-dropdown`, `shadow-dialog`,
   `shadow-popover`. Soft and flat by default for metric cards.
7. **Metric surfaces** — use `MetricCard` with a `tone` (`ink` / `gold` / `mint` /
   `lavender`) instead of inventing per-feature KPI layouts.

## Accessibility

- Contrast targets AA for text on surfaces in each portal palette
- Focus rings use `--ring` (portal primary / accent)
- Selection styles use primary tokens
- Overlays use `--overlay` so scrims stay theme-aware
- Pastel metric cards use dark charcoal foregrounds for contrast

## Performance

- Themes are CSS custom properties — no styled-components runtime
- `ThemeProvider` only syncs `data-portal` and wraps `next-themes`
- No per-component theme context subscriptions required for styling

## Future extension

1. Add a portal id to `PORTAL_IDS` in `tokens.ts`
2. Create `src/themes/<portal>.ts` with `SemanticColorTokens`
3. Register it in `portalThemes` (`index.ts`)
4. Mirror CSS under `[data-portal='<portal>']` in `globals.css`
5. Point `portalConfig.theme` (or env) at the new portal

Keep TypeScript presets and `globals.css` blocks in sync — TS is the authored
contract; CSS is the runtime surface for Tailwind / SSR.

## Related docs

- [Architecture](./architecture.md) — folder layout and shared principles
- [Conventions](./conventions.md) — naming and commit standards
