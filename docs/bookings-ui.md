# Booking Module UI

Phase 4.5 documents the polished Booking Module UI: design-system usage,
component architecture, responsive strategy, and accessibility expectations.

Related feature docs:

- [Bookings list](./bookings-list.md)
- [Create Booking](./bookings-create.md)
- [Edit Booking](./bookings-edit.md)
- [Booking Details](./bookings-details.md)
- [Bookings data layer](./bookings-data-layer.md)

## Design system usage

Booking screens compose shared primitives — they do not introduce a parallel
visual language.

| Concern       | Source                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Layout shell  | `AppShell`, `PageContainer`, `PageHeader`                                  |
| Surfaces      | shadcn `Card`, `Alert`, `Badge`, `Separator`                               |
| Forms         | shadcn `Input`, `Select`, `Textarea`, `Checkbox`, `Label`                  |
| Actions       | shadcn `Button` variants (`default`, `outline`, `ghost`, …)                |
| Feedback      | `EmptyState`, `ErrorState`, `Skeleton`, Sonner toasts                      |
| Navigation    | `Breadcrumb`, route helpers in `@/constants/routes`                        |
| Status colour | `BookingStatusBadge` (Draft / Confirmed / Ongoing / Completed / Cancelled) |

Spacing rhythm:

- Page sections: `space-y-6` via `PageContainer`
- Form sections: `space-y-5` (mobile) / `space-y-6` (sm+)
- Toolbar → table → pagination: grouped under `space-y-4`
- Cards use the shared `--card-spacing` token from shadcn Card

## Booking UI architecture

```
src/features/bookings/components/
├── booking-breadcrumb.tsx      Shared Bookings → current crumb
├── booking-list*.tsx           List toolbar / table / pagination / states
├── booking-form*.tsx           Shared create + edit form
├── booking-detail*.tsx         Details workspace
├── booking-status-badge.tsx    Status presentation
└── *-skeleton.tsx              Route loading placeholders
```

Rules:

1. Routes stay thin — fetch in Server Components, render feature UI.
2. Client components are limited to interactive surfaces (filters, table sort,
   form, pagination, row menus).
3. No repository / Supabase imports in UI.
4. Create and Edit share one `BookingForm`; mode props control copy and submit.
5. Details reuses the same card section pattern as the form for visual cohesion.

## Responsive strategy

| Breakpoint       | Behaviour                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Mobile portrait  | Stacked booking cards; compact pagination (`page / total`); 2-col action grids; sticky form footer with safe-area padding |
| Mobile landscape | Same stacking; toolbar filters wrap; date-range placeholder hidden below `sm`                                             |
| Tablet (`md+`)   | Sticky-header data table; full pagination controls                                                                        |
| Laptop / desktop | Wider list max-width (`max-w-7xl` / `90rem`); form/detail `max-w-5xl`                                                     |

Avoid horizontal page scroll. The desktop table may scroll horizontally inside
its own container when columns exceed the viewport (`min-w-[56rem]`).

## Accessibility improvements

- Required fields expose visible `*`, `sr-only` “(required)”, and `aria-required`
- Field errors use `role="alert"` and `aria-describedby` / `aria-invalid`
- Status badges include `aria-label="Status: …"`
- Toolbar is a `role="search"` landmark; pagination is a `nav`
- Sort buttons announce column purpose via `aria-label`
- Focus rings follow the shared ring token on links, inputs, and buttons
- Read-only calculated fields are visually muted and removed from tab order
- Empty / error states use clear recovery actions (retry, clear filters, back)

## Loading, empty, and error states

| Screen  | Loading                 | Empty                                       | Error                                    |
| ------- | ----------------------- | ------------------------------------------- | ---------------------------------------- |
| List    | `BookingListSkeleton`   | Contextual empty (filters vs first booking) | `BookingListError` + retry               |
| Create  | `CreateBookingSkeleton` | —                                           | Vehicles alert + form root alert         |
| Edit    | `CreateBookingSkeleton` | —                                           | Load alert / vehicles alert / form alert |
| Details | `BookingDetailSkeleton` | Notes empty panel; route `not-found`        | Destructive alert + back action          |

Skeletons mirror real layout (header, filters/cards, sticky footer) to minimise
layout shift.

## What this phase does not change

- No new business features (calendar, invoices, delete, date-range filtering)
- No data-layer or validation rule changes
- No Vehicle / Dashboard / Settings UI work

## Dev-only: Firefox reload loop

Next.js 16.2.x has a known Firefox bug where `loading.tsx` + slow Server
Components can enter an infinite `location.reload()` loop in development
([vercel/next.js#94128](https://github.com/vercel/next.js/pull/94128)).

This repo pins a `pnpm` patch at `patches/next@16.2.12.patch` that fixes
`wasServedFromCache()` detection. Remove the patch after upgrading past the
upstream fix (Next.js 16.3+).
