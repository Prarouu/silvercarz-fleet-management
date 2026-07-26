# Silver Carz — Rental Management System

Internal rental and fleet management software for **Silver Carz** (Nagpur, Maharashtra). A dashboard-first application used exclusively by internal staff (max 5 admins — Owner and Manager roles). There is no customer login and no public portal.

> **Status:** Phase 1.4 — shared project architecture in place. No business features are implemented yet.

## Tech Stack

| Concern         | Technology                                                     |
| --------------- | -------------------------------------------------------------- |
| Framework       | [Next.js](https://nextjs.org) (App Router)                     |
| Language        | TypeScript (strict mode)                                       |
| Styling         | Tailwind CSS v4 (CSS-based configuration)                      |
| UI components   | [shadcn/ui](https://ui.shadcn.com) (Radix base, CSS variables) |
| Icons           | Lucide React                                                   |
| Forms           | React Hook Form + Zod                                          |
| Tables          | TanStack Table                                                 |
| Server state    | TanStack Query                                                 |
| Notifications   | Sonner                                                         |
| Theming         | next-themes (light default, system supported, dark prepared)   |
| Backend         | Supabase (PostgreSQL, Auth, Storage)                           |
| Dates           | date-fns                                                       |
| Package manager | pnpm                                                           |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack prepare pnpm@10 --activate`)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env.local
# then fill in your Supabase project values

# 3. Start the dev server
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Purpose                            |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Start the development server       |
| `pnpm build`        | Production build                   |
| `pnpm start`        | Serve the production build         |
| `pnpm lint`         | Run ESLint                         |
| `pnpm lint:fix`     | Run ESLint with auto-fix           |
| `pnpm typecheck`    | TypeScript type checking (no emit) |
| `pnpm format`       | Format the codebase with Prettier  |
| `pnpm format:check` | Verify formatting without writing  |

A Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files) and a full typecheck before every commit.

## Folder Structure

```
src/
├── app/                  # Next.js App Router — routing, layouts, global CSS only
├── components/
│   ├── ui/               # shadcn/ui primitives (generated via CLI)
│   ├── shared/           # Reusable business-agnostic composites
│   └── layout/           # App shell components (sidebar, header, …)
├── features/             # Feature modules — each domain owns its UI + logic
├── config/               # App identity, formatting defaults, navigation
├── constants/            # Routes, storage keys, theme, pagination, table defaults
├── types/                # Shared TypeScript contracts (API, pagination, entities)
├── lib/
│   ├── supabase/         # Supabase infrastructure (clients, config, errors)
│   ├── utils.ts          # cn() classname helper
│   ├── format.ts         # Date / currency / number formatting
│   ├── string.ts         # String helpers
│   ├── debounce.ts       # Debounce helper
│   ├── pagination.ts     # Pagination helpers
│   └── errors.ts         # AppError + display-message helpers
├── validations/          # Reusable Zod schemas and parse helpers
├── services/             # ApiResponse helpers + repository contracts
├── hooks/                # Shared generic React hooks
└── providers/            # Theme, TanStack Query, AppProviders composition
docs/                     # Architecture docs (see docs/architecture.md)
public/                   # Static assets (icons, manifest)
```

Conventions:

- **Feature isolation** — everything specific to one domain lives in its `features/<name>/` module. Anything used by two or more features is promoted to `components/shared/` or `lib/`.
- **Thin routes** — files in `app/` only compose feature components; no business logic in pages.
- **Centralized routes & config** — never hardcode paths or app defaults; use `@/constants` and `@/config`.
- **`components/ui/` is CLI-managed** — add primitives with `pnpm dlx shadcn@latest add <component>`; never hand-edit business terms into them.
- Global styles live in `src/app/globals.css` (Tailwind v4 configures theme tokens in CSS; there is no `tailwind.config.ts`).

See [docs/architecture.md](./docs/architecture.md) for how future modules should use services, hooks, providers, types, and utilities.

## Coding Standards

- TypeScript strict mode; `any` is disallowed.
- Named exports preferred (default exports only where Next.js requires them, e.g. pages/layouts).
- Functional components and `async/await` only.
- `no-console` enforced (`console.warn`/`console.error` allowed).
- Formatting is Prettier-owned: single quotes, semicolons, trailing commas, 100-char width, Tailwind class sorting.
- Path alias `@/*` maps to `src/*` (e.g. `@/components`, `@/features`, `@/lib`, `@/hooks`).

## Environment Variables

All variables are documented in [`.env.example`](./.env.example). Never commit real values; `.env*` files are git-ignored (except the example template).

| Variable                        | Purpose                             |
| ------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) API key |

Both values are found in your Supabase dashboard under **Project Settings → API**. They are client-safe by design — Row Level Security (added in a later phase) is the actual security boundary. Service role keys must **never** be added to this project.

Environment validation is fail-fast: if a variable is missing, the app throws a descriptive error at startup instead of failing mysteriously at runtime.

## Shared Architecture (Phase 1.4)

| Layer       | Location           | Use for                                                       |
| ----------- | ------------------ | ------------------------------------------------------------- |
| Config      | `src/config/`      | App name, company, version, locale, currency, date formats    |
| Constants   | `src/constants/`   | `ROUTES`, storage keys, theme, pagination/table defaults      |
| Types       | `src/types/`       | `ApiResponse`, pagination, `BaseEntity`, table/select helpers |
| Utilities   | `src/lib/`         | Formatting, strings, debounce, pagination, `AppError`         |
| Validations | `src/validations/` | Shared Zod primitives (`emailSchema`, `paginationSchema`, …)  |
| Services    | `src/services/`    | `ok` / `fail` / `fromPromise`, `Repository` contracts         |
| Hooks       | `src/hooks/`       | Media query, debounce, local storage, window size, theme      |
| Providers   | `src/providers/`   | `AppProviders` (theme + React Query + tooltips)               |

Rules for upcoming feature work:

- Return `ApiResponse<T>` from service methods; convert failures with `toAppError` / `fail`.
- Put domain schemas under `features/<name>/validations`, composing shared primitives.
- Import routes from `ROUTES` — do not hardcode path strings in features.
- Keep `src/services/` generic; domain repositories and queries live with their feature.

## Supabase Infrastructure

All Supabase access goes through `src/lib/supabase/`. **Never import from `@supabase/supabase-js` or `@supabase/ssr` directly** — this keeps every Supabase touchpoint centralized and swappable.

| File            | Use it in                                         | Purpose                                                                          |
| --------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `client.ts`     | Client Components only                            | Browser client (`createSupabaseBrowserClient`)                                   |
| `server.ts`     | Server Components, Server Actions, Route Handlers | Per-request server client bound to cookies (`createSupabaseServerClient`)        |
| `middleware.ts` | Next.js middleware (wired up in the auth phase)   | Session-refresh client for the Edge runtime                                      |
| `config.ts`     | Anywhere                                          | Validated environment configuration (`supabaseConfig`)                           |
| `errors.ts`     | Anywhere                                          | Error normalization — raw DB errors are never shown to users                     |
| `health.ts`     | Server only, temporary                            | `checkSupabaseConnection()` pings the auth health endpoint; safe to delete later |
| `index.ts`      | Anywhere                                          | Barrel for runtime-agnostic exports (config, errors, `TypedSupabaseClient`)      |

Usage rules for future modules:

- Server code imports `@/lib/supabase/server`; client code imports `@/lib/supabase/client`. The wrong import fails at build time (`server-only` guard / `use client` directive).
- Create the server client **per request** — never cache it in a module-level variable.
- Shared, runtime-agnostic helpers come from the barrel: `import { getErrorMessage } from '@/lib/supabase'`.
- Database types live in `src/types/database.ts`. Once a schema exists, regenerate them with `supabase gen types typescript` — all clients are already typed against `Database`, so no restructuring is needed.

To verify connectivity after configuring `.env.local`, temporarily call `checkSupabaseConnection()` from any Server Component and check the returned status.

## Deployment Notes

- Target platform: **Vercel** (zero-config for Next.js).
- Set environment variables per environment in the Vercel dashboard — no environment logic in code.
- Use separate Supabase projects for development, staging, and production.
- Production deploys from `main` only; rollback via Vercel's instant redeploy of a previous build.
