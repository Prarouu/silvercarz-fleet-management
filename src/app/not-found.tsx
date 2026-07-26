import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

/** App-wide 404 page. Keep feature-specific empty states in their modules. */
export default function NotFound() {
  return (
    <AppShell>
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
    </AppShell>
  );
}
