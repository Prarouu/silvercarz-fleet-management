import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginPanel } from '@/features/auth/components/login-panel';
import { getCurrentUser, resolvePostLoginPath } from '@/lib/auth';
import { AUTH_ERROR_CODES, getAuthErrorMessage } from '@/lib/auth/errors';

export const metadata: Metadata = {
  title: 'Sign in',
};

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[];
    reason?: string | string[];
  }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function resolveInitialError(reason: string | undefined): string | undefined {
  if (reason === AUTH_ERROR_CODES.sessionExpired) {
    return getAuthErrorMessage({
      message: 'session expired',
      code: AUTH_ERROR_CODES.sessionExpired,
    });
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = firstParam(params.next);
  const reason = firstParam(params.reason);

  const user = await getCurrentUser();
  if (user) {
    redirect(resolvePostLoginPath(nextPath));
  }

  return <LoginPanel nextPath={nextPath} initialError={resolveInitialError(reason)} />;
}
