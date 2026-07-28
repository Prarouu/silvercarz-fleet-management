import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';

/** Home redirects to the Admin Dashboard — the post-login landing page. */
export default function HomePage() {
  redirect(ROUTES.dashboard);
}
