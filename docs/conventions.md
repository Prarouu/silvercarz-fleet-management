# Project conventions

Standards for Silver Carz RMS contributors. Follow these so the codebase stays
consistent as Authentication, Booking, and later modules land.

## Git

### Branch naming

```
<type>/<short-kebab-description>
```

| Type       | Use for                                  | Example                    |
| ---------- | ---------------------------------------- | -------------------------- |
| `feat`     | New user-facing capability               | `feat/booking-list`        |
| `fix`      | Bug fix                                  | `fix/sidebar-active-state` |
| `chore`    | Tooling, deps, non-feature work          | `chore/eslint-cleanup`     |
| `docs`     | Documentation only                       | `docs/architecture`        |
| `refactor` | Internal restructure, no behavior change | `refactor/services-result` |
| `test`     | Tests only                               | `test/pagination-helpers`  |

Branch from `main`. Keep branches short-lived and focused on one concern.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>
```

- **type:** `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `style` | `perf`
- **scope (optional):** area touched — `auth`, `bookings`, `ui`, `supabase`, `project`
- **summary:** imperative, lowercase, no period; focus on _why_

Examples:

```
feat(bookings): add booking list filters
fix(supabase): normalize unique-constraint errors
chore(project): prepare project for feature development
docs: clarify feature module layout
```

Husky runs lint-staged (ESLint + Prettier) and `pnpm typecheck` on every commit.

## Naming

| Kind               | Convention                         | Example                         |
| ------------------ | ---------------------------------- | ------------------------------- |
| Folders            | `kebab-case`                       | `features/bookings`             |
| Files (components) | `kebab-case.tsx`                   | `page-header.tsx`               |
| Files (utilities)  | `kebab-case.ts`                    | `use-debounce.ts`               |
| React components   | `PascalCase` named exports         | `export function PageHeader`    |
| Hooks              | `use` + `PascalCase`               | `useDebounce`                   |
| Utilities          | `camelCase` functions              | `formatCurrency`                |
| Constants          | `SCREAMING_SNAKE` or const objects | `ROUTES`, `PAGINATION`          |
| Types / interfaces | `PascalCase`                       | `ApiResponse`, `BaseEntity`     |
| Zod schemas        | `camelCase` + `Schema` suffix      | `emailSchema`, `bookingSchema`  |
| Services           | `camelCase` verbs                  | `getBooking`, `listBookings`    |
| Providers          | `PascalCase` + `Provider`          | `QueryProvider`, `AppProviders` |

### Feature services

Prefer verb-led names that map to use cases:

```ts
// features/bookings/services/booking-service.ts
export async function listBookings(...): Promise<ApiResponse<...>> {}
export async function createBooking(...): Promise<ApiResponse<...>> {}
```

Repository implementations may use noun + `Repository`:

```ts
export class BookingRepository implements Repository<Booking, CreateBooking, UpdateBooking> {}
```

## Imports

1. Prefer the `@/*` path alias. Avoid deep relative imports (`../../../`).
2. Prefer package barrels when they exist and are cycle-safe:
   - `@/config`, `@/constants`, `@/hooks`, `@/providers`, `@/services`, `@/types`, `@/validations`
3. **Do not** import a barrel from inside a module that the barrel re-exports in a way that creates a cycle. Files under `config/` / `constants/` that depend on each other should import specific files (e.g. `@/config/app`, `@/constants/routes`).
4. Supabase clients are **not** re-exported from `@/lib/supabase` — import `@/lib/supabase/client` or `@/lib/supabase/server` explicitly.
5. Never import `@supabase/supabase-js` or `@supabase/ssr` from feature code.

## Components

- **Server Components by default.** Add `'use client'` only when the file needs browser APIs, state, effects, or event handlers.
- **`components/ui/`** — shadcn primitives only. Add via `pnpm dlx shadcn@latest add <name>`.
- **`components/shared/`** — business-agnostic composites used by 2+ features.
- **`components/layout/`** — app shell only (sidebar, header, theme toggle).
- **`features/<name>/components/`** — domain UI.

## TypeScript & quality

- Strict mode is on; `any` is disallowed.
- Prefer `interface` for object shapes; `type` for unions/intersections/aliases.
- Named exports preferred; default exports only where Next.js requires them (pages, layouts, `error.tsx`, `loading.tsx`, `not-found.tsx`).
- `no-console`: only `console.warn` / `console.error` are allowed.

## Error handling

```
unknown → toAppError() / normalizeSupabaseError() → fail() → ApiResponse → ErrorState / toast
```

- App-wide helpers: `@/lib/errors`
- Supabase: `@/lib/supabase/errors`
- Service boundary: `@/services` (`ok` / `fail` / `fromPromise`)
- Route UI: `app/(app)/error.tsx` + `ErrorState`

Do not invent per-feature error frameworks.
