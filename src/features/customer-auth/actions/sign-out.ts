'use server';

/**
 * Customer sign-out Server Action.
 *
 * Clears the Supabase session and returns to the public Book a Car page.
 * Never redirects to the Admin Portal.
 */

import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { signOut } from '@/lib/auth';

export async function customerSignOutAction(): Promise<void> {
  await signOut();
  redirect(ROUTES.home);
}
