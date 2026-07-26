# Authentication & authorization

Silver Carz RMS uses Supabase Auth (email + password) with cookie-based
sessions via `@supabase/ssr`. Application authorization is backed by
`public.profiles` (roles + active flag) and centralized helpers in
`@/lib/auth`. Accounts are created manually by the Owner or in the
Supabase Dashboard — there is no public registration.

## Goals

- Email & password login UI (internal staff only)
- Cookie-based session persistence and refresh
- Proxy + layout protection for application routes
- User profiles synchronized from `auth.users`
- Role-based authorization (`owner` | `manager`) with reusable permissions
- Safe, mapped auth errors (never raw Supabase / database messages)

## Folder layout

```
src/
├── proxy.ts                      # Session refresh + route redirects
├── app/
│   ├── (auth)/                   # Login / forgot-password (no app shell)
│   └── (app)/                    # Authenticated shell (`requireAuth`)
├── lib/
│   ├── auth/                     # Session, profiles, RBAC, guards, errors
│   └── supabase/                 # Clients (browser / server / proxy)
├── features/
│   └── auth/                     # Login UI, Server Actions, Zod schemas
├── types/
│   └── database.ts               # Generated-style Supabase types (profiles)
└── constants/
    └── routes.ts                 # ROUTES.login, forgot/reset password, …

supabase/
└── migrations/
    └── 20260726120000_create_profiles.sql
```

## Authentication flow

```
Unauthenticated user visits a protected page
  → Proxy detects no valid user
  → Redirect to /login?next=<intended-path>
  → User submits email + password (React Hook Form + Zod)
  → signInAction validates, calls signInWithPassword
  → Session cookies written
  → Profile loaded; inactive / missing profile → sign out + safe error
  → Redirect to resolvePostLoginPath(next) (defaults to home)
  → (app) layout requireAuth (active profile) + AppShell
```

Key pieces:

| Piece             | Location                                                      |
| ----------------- | ------------------------------------------------------------- |
| Login page        | `app/(auth)/login/page.tsx`                                   |
| Login UI          | `features/auth/components/login-panel.tsx` + `login-form.tsx` |
| Sign-in action    | `features/auth/actions/sign-in.ts`                            |
| Credential schema | `features/auth/validations/credentials.ts`                    |

Authenticated users with an **active** profile who open `/login` are
redirected home (proxy + page guard).

## Authorization flow

```
Request reaches Server Component / Server Action
  → auth.getUser() validates JWT
  → profiles row loaded (role, is_active, full_name)
  → requireAuth / requireUser / requireRole / requirePermission
  → Centralized permission matrix (permissions.ts)
  → Postgres RLS enforces row access independently
```

Rules:

1. **Never authorize from cookies alone** — always `getUser()` then profile.
2. **`profiles.role` is the source of truth** — not client state.
3. **Prefer `hasPermission` / `requirePermission`** over scattered `if (role === …)`.
4. **Owner and Manager currently share full access** — the matrix is ready
   to diverge when new roles or permissions are added.

## Profile lifecycle

| Event                     | Behavior                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| `auth.users` INSERT       | Trigger `handle_new_user` creates `profiles` (SECURITY DEFINER)          |
| Existing users at migrate | Backfill `INSERT … ON CONFLICT DO NOTHING`                               |
| `auth.users.email` UPDATE | Trigger syncs `profiles.email`                                           |
| `auth.users` DELETE       | `ON DELETE CASCADE` removes the profile                                  |
| Missing row after login   | `ensure_own_profile` RPC via `ensureCurrentProfile()` (Dashboard safety) |
| Client UPDATE             | May update own `full_name` only; role / `is_active` / `id` are protected |

Default role for new users is `manager`. Set `app_metadata.role` to
`owner` (or update the row with the service role) when creating the first
Owner account.

Prefer the database trigger for synchronization. Application code only calls
`ensureCurrentProfile()` as a safety net when a row is missing (e.g. users
created before the migration). Do not duplicate insert/update logic in the UI.

## Role system

| Role    | TypeScript                        | Postgres enum     |
| ------- | --------------------------------- | ----------------- |
| Owner   | `APP_ROLES.owner` / `'owner'`     | `public.app_role` |
| Manager | `APP_ROLES.manager` / `'manager'` | `public.app_role` |

Add a role by:

1. `ALTER TYPE public.app_role ADD VALUE '…'`
2. Extending `APP_ROLES` / `APP_ROLE_VALUES` in `src/lib/auth/roles.ts`
3. Updating `ROLE_PERMISSIONS` in `src/lib/auth/permissions.ts`

## Permission architecture

Permissions live in `PERMISSIONS` (`app:access`, `profiles:read`,
`profiles:manage`, …). Each role maps to `'all'` or an explicit list in
`ROLE_PERMISSIONS`.

Helpers (pure — no I/O):

| Helper          | Purpose                                    |
| --------------- | ------------------------------------------ |
| `hasPermission` | Role → permission check                    |
| `can`           | Same for `AuthUser` / `UserProfile` / role |
| `hasRole`       | Membership in an allowed role list         |
| `isOwner`       | Convenience                                |
| `isManager`     | Convenience                                |

Server guards:

| Helper              | Behavior                                             |
| ------------------- | ---------------------------------------------------- |
| `requireProfile`    | Throws if missing / inactive profile                 |
| `requireUser`       | Active profile → `AuthUser` or throw                 |
| `requireAuth`       | Active profile → `AuthUser` or redirect (+ sign-out) |
| `requireRole`       | Throws forbidden when role not allowed               |
| `requirePermission` | Throws forbidden when permission not granted         |

## Session lifecycle

```
Browser request
  → src/proxy.ts
      → updateSession()  (@/lib/supabase/middleware)
          → createServerClient + auth.getUser()
          → refresh tokens / write Set-Cookie when needed
          → redirect unauthenticated users off protected routes
          → redirect authenticated users off auth screens
  → Server Component / Server Action
      → createSupabaseServerClient()
      → getCurrentUser() / getCurrentProfile() / requireAuth()
  → Client Component (only when needed)
      → createSupabaseBrowserClient()
```

### Rules

1. **Always use `getUser()` for access control** — it validates the JWT with
   Supabase Auth. Do not authorize from `getSession()` alone.
2. **Create the server client per request** — never cache it at module scope.
3. **Return the proxy response** (or a redirect that copies its cookies) so
   refreshed tokens reach the browser.
4. **No service-role key** — only the anon key; RLS remains the data boundary.
5. **Prefer server session** — pass `AuthUser` from layouts into the shell.

## Sign out

```
User chooses Sign out in the header menu
  → signOutAction  (features/auth/actions/sign-out.ts)
  → lib/auth signOut() clears Supabase cookies
  → Redirect to ROUTES.login
```

## Protected route behavior

Route classification is centralized in `@/lib/auth/route-guards`
(path strings from `ROUTES` only):

| Helper                   | Behavior                                       |
| ------------------------ | ---------------------------------------------- |
| `isPublicRoute`          | Auth screens + `/auth/*` callbacks             |
| `isProtectedRoute`       | Everything else                                |
| `getRouteAccess`         | `public` \| `authenticated` (roles-ready)      |
| `allowsRouteAccess`      | Evaluates access against a role                |
| `buildLoginRedirectPath` | `/login?next=…` with open-redirect protection  |
| `resolvePostLoginPath`   | Safe post-login destination (defaults to home) |

Enforcement layers:

1. **Proxy** — session refresh + unauthenticated redirects
2. **`(app)/layout`** — `requireAuth()` (active profile)
3. **Login page** — redirects away when signed in with an active profile
4. **Future** — `getRouteAccess` / `requireRole` for admin-only paths

Proxy stays authentication-focused (no per-request profile query). Profile
and role checks run in server layouts / actions.

## RLS strategy

Migration: `supabase/migrations/20260726120000_create_profiles.sql`

| Policy                  | Command | Rule                                           |
| ----------------------- | ------- | ---------------------------------------------- |
| `profiles_select_own`   | SELECT  | `auth.uid() = id`                              |
| `profiles_select_staff` | SELECT  | Active owner/manager via `current_user_role()` |
| `profiles_update_own`   | UPDATE  | Own row; privileged columns blocked by trigger |

No INSERT / DELETE policies for `authenticated`. Inserts use the
`handle_new_user` SECURITY DEFINER trigger or `ensure_own_profile` RPC.
Role / `is_active` changes require the **service role** (Dashboard SQL or a
future admin API).

`current_user_role()` is SECURITY DEFINER so RLS policies can read the
caller’s role without recursive policy checks.

## Server helpers (`@/lib/auth`)

| Helper                 | Use when                                           |
| ---------------------- | -------------------------------------------------- |
| `getCurrentUser`       | Need the user or `null` (enriched from profile)    |
| `getCurrentProfile`    | Need the profile row or `null`                     |
| `ensureCurrentProfile` | Load or create own profile via RPC (post sign-in)  |
| `getAuthState`         | Need `{ user, profile, isAuthenticated }`          |
| `isAuthenticated`      | Boolean check                                      |
| `getCurrentSession`    | Session metadata only (not for authorization)      |
| `getCurrentUserRole`   | Active profile role or `null`                      |
| `requireUser`          | Server Actions — throws if unsigned / inactive     |
| `requireAuth`          | Pages / layouts — redirects if unsigned / inactive |
| `requireRole`          | Fail closed on role mismatch                       |
| `requirePermission`    | Fail closed on permission mismatch                 |
| `signOut`              | Clears cookies                                     |
| `toAuthError`          | Map Auth failures to safe `AppError` messages      |

Import from `@/lib/auth` in server code. Client code must import shared
utilities from specific modules (`errors`, `route-guards`, `authorization`,
`types`, `roles`, `permissions`) because the `@/lib/auth` barrel is
`server-only`.

## Error handling

UI messages come from `toAuthError` / `getAuthErrorMessage` /
`getAuthErrorMessageForCode`. Examples:

| Code / situation | User-facing message                                         |
| ---------------- | ----------------------------------------------------------- |
| Unauthorized     | You must be signed in to continue.                          |
| Forbidden        | You do not have permission to perform this action.          |
| Inactive account | Your account is inactive. Contact an administrator.         |
| Missing profile  | Your account profile is missing. Contact an administrator.  |
| DB setup needed  | Database setup is incomplete. Apply the profiles migration… |
| Session expired  | Your session has expired. Please sign in again.             |

Login supports
`?reason=session_expired|inactive_account|missing_profile|database_setup_required`.

Never display raw Supabase Auth or Postgres errors.

## Future user management

When building an admin “Users” screen:

1. List profiles with `profiles_select_staff` (already allowed for staff).
2. Change `role` / `is_active` only via a trusted server path using the
   service role (or a SECURITY DEFINER RPC) — never from the browser anon key.
3. Optionally narrow `ROLE_PERMISSIONS` so only Owner gets `profiles:manage`.
4. Keep creating Auth users in the Dashboard (or Admin API); the trigger
   continues to create matching profiles.

## Applying the migration

```bash
# Linked Supabase project
pnpm dlx supabase db push

# Or run the SQL in the Supabase SQL Editor
```

Then regenerate types if desired:

```bash
pnpm dlx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

## Security checklist

- Secrets: only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service role in the app bundle
- Auth errors normalized before UI display
- Open-redirect protection in `resolvePostLoginPath` / login redirect builders
- RLS enabled (+ forced) on `profiles`
- Privileged profile columns protected from authenticated updates
- No public signup / social / magic-link providers in the MVP

## Out of scope (later phases)

- Booking, vehicles, customers, drivers, reports
- Admin user-management UI
- Self-service password reset email flow
