import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';

/** `/admin` redirects to the Admin Dashboard — the post-login landing page. */
export default function AdminHomePage() {
  redirect(ROUTES.dashboard);
}
