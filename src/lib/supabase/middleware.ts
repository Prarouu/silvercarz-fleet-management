/**
 * Supabase session helpers for the Next.js Proxy (formerly Middleware).
 *
 * `updateSession` refreshes expired auth tokens, keeps cookies in sync,
 * and enforces public vs protected route redirects.
 *
 * Do NOT use outside the proxy entrypoint. Server code uses
 * `@/lib/supabase/server`; client code uses `@/lib/supabase/client`.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import {
  buildCustomerLoginRedirectPath,
  buildLoginRedirectPath,
  isAdminAuthRoute,
  isCustomerAuthRoute,
  isCustomerProtectedRoute,
  isProtectedRoute,
  resolveCustomerPostLoginPath,
  resolvePostLoginPath,
} from '@/lib/auth/route-guards';
import { supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  return {
    supabase,
    /** Always return this response from the proxy so cookie updates are kept. */
    getResponse: () => response,
  };
}

function copySessionCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
  return to;
}

function redirectWithSession(request: NextRequest, sessionResponse: NextResponse, href: string) {
  const redirectResponse = NextResponse.redirect(new URL(href, request.url));
  return copySessionCookies(sessionResponse, redirectResponse);
}

/**
 * Refreshes the Supabase auth session and applies auth route redirects.
 *
 * Important: call `getUser()` immediately after creating the client — do not
 * run other logic in between. Always return a response derived from
 * `getResponse()` so refreshed cookies reach the browser.
 *
 * Role checks for customers on `/admin/*` run in the admin layout
 * (`requireStaffAuth`) — the proxy stays authentication-focused.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);

  // Validates the JWT and refreshes tokens when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionResponse = getResponse();
  const { pathname, search } = request.nextUrl;
  const nextPath = `${pathname}${search}`;

  if (!user && isProtectedRoute(pathname)) {
    return redirectWithSession(request, sessionResponse, buildLoginRedirectPath(nextPath));
  }

  if (!user && isCustomerProtectedRoute(pathname)) {
    return redirectWithSession(request, sessionResponse, buildCustomerLoginRedirectPath(nextPath));
  }

  if (user && isAdminAuthRoute(pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next');
    return redirectWithSession(request, sessionResponse, resolvePostLoginPath(nextParam));
  }

  if (user && isCustomerAuthRoute(pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next');
    return redirectWithSession(request, sessionResponse, resolveCustomerPostLoginPath(nextParam));
  }

  return sessionResponse;
}
