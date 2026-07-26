# Shared Architecture

Phase 1.4 establishes the shared foundation every feature module builds on.
This layer is intentionally **domain-agnostic** — no bookings, vehicles,
customers, drivers, or authentication logic lives here.

## Folder structure

```
src/
├── app/                 # Next.js routes, layouts, global CSS only
├── components/
│   ├── ui/              # shadcn primitives (CLI-managed)
│   ├── shared/          # Business-agnostic composites (EmptyState, PageHeader, …)
│   └── layout/          # App shell (sidebar, header)
├── features/            # Domain modules (added as features are built)
├── config/              # App identity, formatting defaults, navigation
├── constants/           # Routes, storage keys, theme, pagination, table defaults
├── types/               # Shared TypeScript contracts
├── lib/                 # Utilities, formatting, errors, Supabase infra
├── validations/         # Reusable Zod schemas and helpers
├── services/            # Service result helpers + repository contracts
├── hooks/               # Generic React hooks
├── providers/           # Theme, TanStack Query, provider composition
└── styles/              # (reserved) shared style helpers if needed later
```

## Design principles

1. **Thin routes** — `app/` composes feature UI; no business logic in pages.
2. **Feature isolation** — domain code lives in `features/<name>/`. Promote to
   shared folders only when two or more features need the same abstraction.
3. **No hardcoded paths** — always use `ROUTES` from `@/constants/routes`.
4. **No hardcoded app defaults** — names, currency, date formats, and page
   sizes come from `@/config/app` / `@/constants/*`.
5. **Normalized errors** — never format raw infrastructure errors in UI code.
6. **Named exports** — prefer named exports; default exports only where Next.js
   requires them (pages/layouts).

## How future modules should use the shared layer

### Config (`@/config`)

```ts
import { appConfig } from '@/config/app';

appConfig.name; // "Silver Carz"
appConfig.currency; // "INR"
appConfig.dateFormat; // "dd MMM yyyy"
```

### Constants (`@/constants`)

```ts
import { ROUTES, PAGINATION, STORAGE_KEYS, THEME } from '@/constants';

router.push(ROUTES.bookings);
const pageSize = PAGINATION.defaultPageSize;
```

### Types (`@/types`)

Use shared contracts for list/API surfaces:

- `ApiResponse<T>` — success/failure envelope
- `PaginatedResult<T>` / `ListQueryParams` — list queries
- `BaseEntity` / `TimestampFields` — persisted records
- `SelectOption` / `SortOrder` / `TableColumn` — UI building blocks

Feature-specific types stay in `features/<name>/types`.

### Utilities (`@/lib`)

| Module       | Purpose                                                          |
| ------------ | ---------------------------------------------------------------- |
| `utils`      | `cn()` className merge (shadcn convention)                       |
| `format`     | `formatDate`, `formatDateTime`, `formatCurrency`, `formatNumber` |
| `string`     | `capitalize`, `toTitleCase`, `truncate`, `isBlank`, …            |
| `debounce`   | generic debounce helper                                          |
| `pagination` | `createPaginatedResult`, `normalizePaginationParams`, `toOffset` |
| `errors`     | `AppError`, `toAppError`, `getDisplayErrorMessage`               |
| `supabase`   | clients, config, Supabase-specific error normalization           |

### Services (`@/services`)

```ts
import { fromPromise, ok, fail, type Repository } from '@/services';
import type { ApiResponse } from '@/types';

// Public service methods return ApiResponse<T>
export async function getThing(id: string): Promise<ApiResponse<Thing>> {
  return fromPromise(async () => repository.findById(id));
}
```

- Implement domain repositories against `Repository` / `ReadRepository`.
- Wrap side effects with `fromPromise` / `ok` / `fail`.
- Do **not** put SQL, Supabase queries, or domain rules in `src/services/`.
  Those belong in feature modules.

### Validations (`@/validations`)

Compose shared Zod primitives (`emailSchema`, `phoneSchema`,
`paginationSchema`, …). Domain schemas go in `features/<name>/validations`.

### Hooks (`@/hooks`)

Generic only: media query, mounted, debounce, window size, local storage,
theme. Domain hooks belong in the feature that owns them.

### Providers (`@/providers`)

`AppProviders` is the single composition root used by `app/layout.tsx`.
Today it wires:

1. Theme (`next-themes`)
2. TanStack Query
3. Tooltip provider

Add future cross-cutting providers (e.g. auth) here — not ad hoc in layouts.

## Error handling flow

```
unknown error
  → toAppError() / normalizeSupabaseError()
  → fail() → ApiResponse failure
  → UI reads response.error.message / ErrorState
```

- App-wide: `@/lib/errors`
- Supabase-specific: `@/lib/supabase/errors`
- Service boundary: `@/services` (`ok` / `fail` / `fromPromise`)

## What this phase deliberately does not include

- Authentication / middleware
- API routes / server actions
- Database tables or SQL
- Booking / vehicle / customer / driver logic
- Feature CRUD UI

Those arrive in later phases on top of this foundation.
