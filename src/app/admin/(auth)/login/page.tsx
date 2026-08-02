import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { LoginPanel } from '@/features/auth/components/login-panel';
import { getAuthState, isStaff, resolvePostLoginPath } from '@/lib/auth';
import { AUTH_ERROR_CODES, getAuthErrorMessageForCode } from '@/lib/auth/errors';

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
  if (!reason) {
    return undefined;
  }

  if (
    reason === AUTH_ERROR_CODES.sessionExpired ||
    reason === AUTH_ERROR_CODES.inactiveAccount ||
    reason === AUTH_ERROR_CODES.missingProfile ||
    reason === AUTH_ERROR_CODES.databaseSetupRequired
  ) {
    return getAuthErrorMessageForCode(reason);
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = firstParam(params.next);
  const reason = firstParam(params.reason);

  const { user, profile } = await getAuthState();
  if (user && profile?.isActive) {
    if (isStaff(profile)) {
      redirect(resolvePostLoginPath(nextPath));
    }
    // Customers must use the customer portal — never enter admin.
    redirect(ROUTES.home);
  }

  return <LoginPanel nextPath={nextPath} initialError={resolveInitialError(reason)} />;
}
