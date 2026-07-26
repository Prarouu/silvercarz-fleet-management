import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export function CreateBookingSkeleton() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4" aria-busy="true" aria-label="Loading booking form">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-xl ring-1 ring-foreground/10">
            <div className="space-y-2 border-b px-4 py-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}

        <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-24 sm:h-8" />
            <Skeleton className="h-9 w-32 sm:h-8" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
