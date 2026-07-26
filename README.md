# Silver Carz — Rental Management System

Internal rental and fleet management software for **Silver Carz** (Nagpur, Maharashtra). A dashboard-first application used exclusively by internal staff (max 5 admins — Owner and Manager roles). There is no customer login and no public portal.

> **Status:** Phase 1.1 — project foundation only. No business features are implemented yet.

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
│   ├── dashboard/
│   └── bookings/
├── lib/
│   ├── supabase/         # Supabase client factories (future phase)
│   └── utils.ts          # cn() and shared utilities
├── hooks/                # Shared generic React hooks
├── providers/            # App-level providers (theme, …)
├── services/             # External service integrations
├── types/                # Global TypeScript types
├── constants/            # App-wide constants and enums
└── config/               # Static app configuration
docs/                     # Architecture docs and decision records
public/                   # Static assets (icons, manifest)
```

Conventions:

- **Feature isolation** — everything specific to one domain lives in its `features/<name>/` module. Anything used by two or more features is promoted to `components/shared/` or `lib/`.
- **Thin routes** — files in `app/` only compose feature components; no business logic in pages.
- **`components/ui/` is CLI-managed** — add primitives with `pnpm dlx shadcn@latest add <component>`; never hand-edit business terms into them.
- Global styles live in `src/app/globals.css` (Tailwind v4 configures theme tokens in CSS; there is no `tailwind.config.ts`).

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

## Deployment Notes

- Target platform: **Vercel** (zero-config for Next.js).
- Set environment variables per environment in the Vercel dashboard — no environment logic in code.
- Use separate Supabase projects for development, staging, and production.
- Production deploys from `main` only; rollback via Vercel's instant redeploy of a previous build.
