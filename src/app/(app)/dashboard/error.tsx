'use client';

import { ErrorState } from '@/components/shared/error-state';
import { PageContainer } from '@/components/shared/page-container';
import { getDisplayErrorMessage } from '@/lib/errors';

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <ErrorState
        title="Dashboard unavailable"
        description={getDisplayErrorMessage(error)}
        onRetry={unstable_retry}
      />
    </PageContainer>
  );
}
