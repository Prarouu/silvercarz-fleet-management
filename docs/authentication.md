# Authentication architecture

Phase 2.1a establishes the Supabase Auth foundation for Silver Carz RMS.
This phase covers **infrastructure only** — no login UI, no role enforcement
UI, and no business modules.

## Goals

- Email & password authentication (ready for Server Actions)
- Cookie-based session persistence via `@supabase/ssr`
- Works with Server Components, Client Components, Server Actions, and Proxy
- Typed session / user helpers with room for roles and password reset
- Safe, mapped auth errors (never raw Supabase Auth messages)

## Folder layout

```
src/
├── proxy.ts                    # Next.js Proxy — session refresh entrypoint
├── lib/
│   ├── auth/                   # Session, guards, errors, sign-out, route helpers
│   └── supabase/               # Clients (browser / server / proxy)
├── features/
│   └── auth/                   # Feature-owned Zod schemas (login UI later)
└── constants/
    └── routes.ts               # ROUTES.login, forgot/reset password, callback
```

## Session flow

```
Browser request
  → src/proxy.ts
      → updateSession()  (@/lib/supabase/middleware)
          → createServerClient + auth.getUser()
          → refresh tokens / write Set-Cookie when needed
  → Server Component / Server Action
      → createSupabaseServerClient()
      → getCurrentUser() / requireAuth() / requireUser()
  → Client Component (when needed)
      → createSupabaseBrowserClient()
```

### Rules

1. **Always use `getUser()` for access control** — it validates the JWT with
   Supabase Auth. Do not authorize from `getSession()` alone.
2. **Create the server client per request** — never cache it at module scope.
3. **Return the proxy response** from `updateSession` so refreshed cookies
   reach the browser.
4. **No service-role key** — only the anon key; RLS remains the data boundary.

## Proxy purpose

Next.js 16 renames Middleware → **Proxy** (`src/proxy.ts`).

Current responsibility:

- Refresh expired sessions on matched routes
- Stay lightweight (no domain logic, no hardcoded path strings)

Prepared but not yet enforced:

- Route classification via `@/lib/auth/route-guards`
  (`isPublicRoute`, `isProtectedRoute`, `buildLoginRedirectPath`, …)
- Redirect unauthenticated users to `ROUTES.login` once the Login UI exists

Matcher excludes static assets (`_next/static`, images, favicon).

## Server helpers (`@/lib/auth`)

| Helper               | Use when                                           |
| -------------------- | -------------------------------------------------- |
| `getCurrentUser`     | Need the user or `null`                            |
| `getAuthState`       | Need `{ user, isAuthenticated }`                   |
| `isAuthenticated`    | Boolean check                                      |
| `getCurrentSession`  | Need session metadata (not for authorization)      |
| `getCurrentUserRole` | Future RBAC (`app_metadata.role`)                  |
| `requireUser`        | Server Actions / services — throws if signed out   |
| `requireAuth`        | Pages / layouts — redirects to login if signed out |
| `signOut`            | Server Action sign-out                             |
| `toAuthError`        | Map Auth failures to safe `AppError` messages      |

Import from `@/lib/auth`. Session/guard modules are `server-only`.

## Future login flow

1. Add `app/(auth)/login/page.tsx` composing `features/auth` UI.
2. Server Action validates with `signInCredentialsSchema`, then
   `supabase.auth.signInWithPassword`.
3. Map failures with `toAuthError` → toast / form errors.
4. On success, redirect via `resolvePostLoginPath(next)`.
5. Enable proxy redirects for `isProtectedRoute` using `ROUTES` helpers.

Credential schemas already live in `features/auth/validations`.

## Future authorization flow

1. Store role in Supabase `app_metadata.role` (`owner` | `manager`).
2. `toAuthUser` / `getCurrentUserRole` already read that field.
3. Add `requireRole(...)` beside `requireUser` when policies are defined.
4. Mirror roles in Postgres + RLS for data access (never trust the client).

## Future password reset

Routes are reserved in `ROUTES`:

- `forgotPassword` → `/forgot-password`
- `resetPassword` → `/reset-password`
- `authCallback` → `/auth/callback`

Schemas: `resetPasswordRequestSchema`, `updatePasswordSchema`.

## Security checklist

- Secrets: only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service role in the app
- Auth errors normalized before UI display
- Open-redirect protection in `resolvePostLoginPath` / login redirect builders
- Cookie writes include cache-control headers from `@supabase/ssr` `setAll`

## What this phase does not include

- Login / logout UI
- Enforced route redirects in the proxy
- Profiles, booking, vehicles, customers, invoices
- Database business tables
