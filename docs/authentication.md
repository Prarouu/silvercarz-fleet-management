# Authentication architecture

Silver Carz RMS uses Supabase Auth (email + password) with cookie-based
sessions via `@supabase/ssr`. Accounts are created manually by the Owner or
in the Supabase Dashboard — there is no public registration.

## Goals

- Email & password login UI (internal staff only)
- Cookie-based session persistence and refresh
- Proxy + layout protection for application routes
- Typed session helpers with room for roles and password reset
- Safe, mapped auth errors (never raw Supabase Auth messages)

## Folder layout

```
src/
├── proxy.ts                      # Session refresh + route redirects
├── app/
│   ├── (auth)/                   # Login / forgot-password (no app shell)
│   └── (app)/                    # Authenticated shell (`requireAuth`)
├── lib/
│   ├── auth/                     # Session, guards, errors, sign-out helper
│   └── supabase/                 # Clients (browser / server / proxy)
├── features/
│   └── auth/                     # Login UI, Server Actions, Zod schemas
└── constants/
    └── routes.ts                 # ROUTES.login, forgot/reset password, …
```

## Login flow

```
Unauthenticated user visits a protected page
  → Proxy detects no valid user
  → Redirect to /login?next=<intended-path>
  → User submits email + password (React Hook Form + Zod)
  → signInAction validates, calls signInWithPassword
  → Session cookies written
  → Redirect to resolvePostLoginPath(next) (defaults to home)
  → (app) layout requireAuth + AppShell render with current user
```

Key pieces:

| Piece             | Location                                                      |
| ----------------- | ------------------------------------------------------------- |
| Login page        | `app/(auth)/login/page.tsx`                                   |
| Login UI          | `features/auth/components/login-panel.tsx` + `login-form.tsx` |
| Sign-in action    | `features/auth/actions/sign-in.ts`                            |
| Credential schema | `features/auth/validations/credentials.ts`                    |

Authenticated users who open `/login` are redirected home (proxy + page guard).

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
      → getCurrentUser() / requireAuth() / requireUser()
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
   Avoid a client AuthProvider that re-fetches the session on every mount.

Sessions persist across browser refresh via Auth cookies. The proxy restores
and refreshes them on matched navigations.

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
| `buildLoginRedirectPath` | `/login?next=…` with open-redirect protection  |
| `resolvePostLoginPath`   | Safe post-login destination (defaults to home) |

Enforcement layers:

1. **Proxy** — optimistic redirects before the page renders
2. **`(app)/layout`** — `requireAuth()` before the app shell
3. **Login page** — redirects away when already signed in

## Server helpers (`@/lib/auth`)

| Helper               | Use when                                           |
| -------------------- | -------------------------------------------------- |
| `getCurrentUser`     | Need the user or `null`                            |
| `getAuthState`       | Need `{ user, isAuthenticated }`                   |
| `isAuthenticated`    | Boolean check                                      |
| `getCurrentSession`  | Session metadata only (not for authorization)      |
| `getCurrentUserRole` | Future RBAC (`app_metadata.role`)                  |
| `requireUser`        | Server Actions / services — throws if signed out   |
| `requireAuth`        | Pages / layouts — redirects to login if signed out |
| `signOut`            | Clears cookies (called from `signOutAction`)       |
| `toAuthError`        | Map Auth failures to safe `AppError` messages      |

Import from `@/lib/auth` in server code. Client code must import shared
utilities from specific modules (`errors`, `route-guards`, `types`) because
the `@/lib/auth` barrel is `server-only`.

## Error handling

UI messages come from `toAuthError` / `getAuthErrorMessage`. Examples:

- Invalid email/password
- Session expired (`?reason=session_expired` on the login page)
- Rate limiting
- Network / unexpected failures

Never display raw Supabase Auth API strings.

## Future authorization flow

1. Store role in Supabase `app_metadata.role` (`owner` | `manager`).
2. `toAuthUser` / `getCurrentUserRole` already read that field.
3. Add `requireRole(...)` beside `requireUser` when policies are defined.
4. Mirror roles in Postgres + RLS for data access (never trust the client).

## Future password reset

Routes are reserved in `ROUTES`:

- `forgotPassword` → `/forgot-password` (MVP: contact administrator)
- `resetPassword` → `/reset-password`
- `authCallback` → `/auth/callback`

Schemas: `resetPasswordRequestSchema`, `updatePasswordSchema`.

## Security checklist

- Secrets: only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service role in the app
- Auth errors normalized before UI display
- Open-redirect protection in `resolvePostLoginPath` / login redirect builders
- Cookie writes include cache-control headers from `@supabase/ssr` `setAll`
- No public signup / social / magic-link providers in the MVP

## Out of scope (later phases)

- Role-based authorization UI/enforcement
- Profiles, settings, admin user management
- Booking, vehicles, customers, drivers, reports
- Self-service password reset email flow
