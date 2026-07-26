import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { getCurrentUser } from '@/lib/auth';

function NotFoundContent() {
  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.home}>Back to home</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}

/** App-wide 404 page. Keep feature-specific empty states in their modules. */
export default async function NotFound() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-4">
        <NotFoundContent />
      </div>
    );
  }

  return (
    <AppShell user={user}>
      <NotFoundContent />
    </AppShell>
  );
}
