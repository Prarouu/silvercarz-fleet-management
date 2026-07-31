import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Generic in-shell page placeholder. Matches typical page height so route
 * transitions do not collapse to a spinner (major CLS source).
 */
export function AppContentSkeleton() {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <div className="space-y-6" aria-busy="true" aria-label="Loading page">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[8.5rem] flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6"
            >
              <Skeleton className="size-9 rounded-lg" />
              <div className="mt-auto space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>

        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    </PageContainer>
  );
}
