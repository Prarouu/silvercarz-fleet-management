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

| Promote to shared                      | Keep in the feature                 |
| -------------------------------------- | ----------------------------------- |
| Used by 2+ features                    | Used by one feature only            |
| Pure UI shell (EmptyState, PageHeader) | Domain forms, tables, status badges |
| Generic hooks (debounce, media query)  | Booking filters, vehicle selectors  |
| Cross-cutting types (`ApiResponse`)    | `Booking`, `Vehicle`, domain DTOs   |

## Auth feature

`features/auth/` holds feature-owned schemas for the upcoming login UI.
Session infrastructure, guards, and sign-out live in `@/lib/auth` — import
those from there, not from this folder.

Scaffold folders for bookings/dashboard remain reserved for upcoming phases.
