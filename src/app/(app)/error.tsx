'use client';

import { ErrorState } from '@/components/shared/error-state';
import { PageContainer } from '@/components/shared/page-container';
import { getDisplayErrorMessage } from '@/lib/errors';

/**
 * Route-level error boundary for the app shell.
 * Uses shared error utilities so feature modules can follow the same pattern.
 */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="Something went wrong"
        description={getDisplayErrorMessage(error)}
        onRetry={unstable_retry}
      />
    </PageContainer>
  );
}
