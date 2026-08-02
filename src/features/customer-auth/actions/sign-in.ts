'use server';

/**
 * Customer sign-in Server Action.
 *
 * Uses the same Supabase Auth project as admin. On success, redirects to a
 * safe customer-portal destination (never `/admin/*`).
 */

import { redirect } from 'next/navigation';

import {
  signInCredentialsSchema,
  type SignInCredentials,
} from '@/features/customer-auth/validations/credentials';
import {
  createInactiveAccountError,
  ensureCurrentProfile,
  resolveCustomerPostLoginPath,
  signOut,
  toAuthError,
} from '@/lib/auth';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fail, failWith } from '@/services';
import type { ApiResponse } from '@/types';

export type CustomerSignInActionResult = ApiResponse<null>;

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
 * Authenticates a customer with email + password and redirects on success.
 */
export async function customerSignInAction(
  credentials: SignInCredentials,
  nextPath?: string | null,
): Promise<CustomerSignInActionResult> {
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

    const profile = await ensureCurrentProfile();

    if (!profile.isActive) {
      await signOut().catch(() => undefined);
      return fail(createInactiveAccountError());
    }
  } catch (error) {
    if (error instanceof AppError) {
      await signOut().catch(() => undefined);
      return fail(error);
    }

    if (isNetworkError(error)) {
      return failWith(ERROR_CODES.network, 'Unable to sign in. Please try again.');
    }

    return fail(toAuthError(error));
  }

  redirect(resolveCustomerPostLoginPath(nextPath));
}
