'use server';

/**
 * Sign-out Server Action.
 *
 * Clears the Supabase Auth session cookies and sends the user to login.
 */

import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { signOut } from '@/lib/auth';

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(ROUTES.login);
}
