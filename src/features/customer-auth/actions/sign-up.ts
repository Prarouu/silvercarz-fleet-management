'use server';

/**
 * Customer sign-up Server Action.
 *
 * Creates a Supabase Auth user. Profile + `customer` role are assigned by the
 * existing `handle_new_user` trigger (never from client-supplied role fields).
 */

import { redirect } from 'next/navigation';

import {
  customerSignUpSchema,
  type CustomerSignUpInput,
} from '@/features/customer-auth/validations/credentials';
import {
  AUTH_ERROR_CODES,
  createInactiveAccountError,
  ensureCurrentProfile,
  resolveCustomerPostLoginPath,
  signOut,
  toAuthError,
} from '@/lib/auth';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fail, failWith, ok } from '@/services';
import type { ApiResponse } from '@/types';

export type CustomerSignUpActionResult = ApiResponse<{
  readonly emailConfirmationRequired: boolean;
}>;

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
 * Registers a customer account.
 *
 * - If email confirmation is disabled and a session is created → redirect.
 * - If email confirmation is required → return a success payload with a message.
 */
export async function customerSignUpAction(
  input: CustomerSignUpInput,
  nextPath?: string | null,
): Promise<CustomerSignUpActionResult> {
  const parsed = customerSignUpSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return failWith(
      ERROR_CODES.validation,
      firstIssue?.message ?? 'Unable to create your account.',
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
        },
      },
    });

    if (error) {
      return fail(toAuthError(error));
    }

    // Supabase may return a user with empty identities when the email is taken
    // and confirmation settings obscure the conflict.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return failWith(
        AUTH_ERROR_CODES.userAlreadyExists,
        'An account with this email already exists. Please sign in instead.',
      );
    }

    if (!data.session) {
      return ok({ emailConfirmationRequired: true });
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
      return failWith(ERROR_CODES.network, 'Unable to create your account. Please try again.');
    }

    return fail(toAuthError(error));
  }

  redirect(resolveCustomerPostLoginPath(nextPath));
}
