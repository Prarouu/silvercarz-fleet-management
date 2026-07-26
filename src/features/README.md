# Feature modules

Domain code lives under `src/features/<name>/`. Keep each module self-contained
until a second feature needs the same abstraction — then promote it to
`components/shared/`, `lib/`, `hooks/`, or `types/`.

## Recommended layout

```
features/<name>/
├── components/       # Feature-only UI
├── hooks/            # Feature-only React hooks
├── services/         # Data access + ApiResponse-returning methods
├── validations/      # Zod schemas composed from @/validations
├── types/            # Feature-only TypeScript types
└── index.ts          # Public exports for the feature (optional)
```

## Rules

1. **Thin routes** — `app/` pages import and render feature components; they
   contain no business logic.
2. **Centralized routes** — navigate with `ROUTES` from `@/constants`.
3. **Service boundary** — public methods return `ApiResponse<T>` via
   `@/services` (`ok` / `fail` / `fromPromise`).
4. **Errors** — normalize with `@/lib/errors` and/or `@/lib/supabase/errors`
   before showing anything in the UI.
5. **Supabase** — import clients from `@/lib/supabase/server` or
   `@/lib/supabase/client`, never from `@supabase/*` directly.
6. **Named exports** — prefer named exports from feature modules.

## When to share vs keep local

| Promote to shared                                         | Keep in the feature                 |
| --------------------------------------------------------- | ----------------------------------- |
| Used by 2+ features                                       | Used by one feature only            |
| Pure UI shell (EmptyState, PageHeader)                    | Domain forms, tables, status badges |
| Generic hooks (debounce, media query)                     | Booking filters, vehicle selectors  |
| Cross-cutting types (`ApiResponse`, `Booking`, `Vehicle`) | One-off view models / UI-only props |

Shared booking/vehicle models and Zod schemas live in `@/types` and
`@/validations`. Feature folders re-export them for convenience — see
[docs/types-and-validation.md](../../docs/types-and-validation.md).

## Auth feature

`features/auth/` owns the login UI, sign-in / sign-out Server Actions, and
credential schemas. Session infrastructure and route guards live in
`@/lib/auth` — import those from there, not from this folder.

## Bookings

`features/bookings/` includes repository, service, Server Actions, domain
errors, booking list UI, the shared create/edit `BookingForm`, and the Booking
Details workspace. Call Server Actions from UI — never import the repository in
components.

- [Bookings data layer](../../docs/bookings-data-layer.md)
- [Bookings list UI](../../docs/bookings-list.md)
- [Create Booking UI](../../docs/bookings-create.md)
- [Edit Booking UI](../../docs/bookings-edit.md)
- [Booking Details UI](../../docs/bookings-details.md)

## Vehicles

`features/vehicles/` includes repository, service, Server Actions, domain
errors, and the Fleet Management list UI. Call Server Actions from UI — never
import the repository in components. Add / Edit / Details pages are deferred.

- [Vehicles data layer](../../docs/vehicles-data-layer.md)
- [Vehicles list UI](../../docs/vehicles-list.md)
