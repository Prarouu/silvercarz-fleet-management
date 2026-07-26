'use server';

/**
 * Sign-in Server Action.
 *
 * Validates credentials, establishes a Supabase Auth session (cookies),
 * then redirects to the intended destination. Failures return a safe
 * `ApiResponse` — never raw Supabase errors.
 */

import { redirect } from 'next/navigation';

import {
  signInCredentialsSchema,
  type SignInCredentials,
} from '@/features/auth/validations/credentials';
import { resolvePostLoginPath, toAuthError } from '@/lib/auth';
import { ERROR_CODES } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fail, failWith } from '@/services';
import type { ApiResponse } from '@/types';

export type SignInActionResult = ApiResponse<null>;

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message: unknown }).message).toLowerCase();
    return message.includes('fetch failed') || message.includes('network');
  }

  return false;
}

/**
 * Authenticates with email + password and redirects on success.
 * Returns a failure `ApiResponse` when validation or Auth fails.
 */
export async function signInAction(
  credentials: SignInCredentials,
  nextPath?: string | null,
): Promise<SignInActionResult> {
  const parsed = signInCredentialsSchema.safeParse(credentials);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return failWith(ERROR_CODES.validation, firstIssue?.message ?? 'Invalid email or password.');
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return fail(toAuthError(error));
    }
  } catch (error) {
    if (isNetworkError(error)) {
      return failWith(ERROR_CODES.network, 'Network error. Check your connection and try again.');
    }

    return fail(toAuthError(error));
  }

  redirect(resolvePostLoginPath(nextPath));
}
