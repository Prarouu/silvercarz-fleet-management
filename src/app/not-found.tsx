import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { getAuthState, toAuthUserFromProfile } from '@/lib/auth';

function NotFoundContent({ homeHref }: { homeHref: string }) {
  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={homeHref}>Back to home</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}

/** App-wide 404 page. Keep feature-specific empty states in their modules. */
export default async function NotFound() {
  const { profile } = await getAuthState();

  if (!profile?.isActive) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-4">
        <NotFoundContent homeHref={ROUTES.home} />
      </div>
    );
  }

  return (
    <AppShell user={toAuthUserFromProfile(profile)}>
      <NotFoundContent homeHref={ROUTES.dashboard} />
    </AppShell>
  );
}
