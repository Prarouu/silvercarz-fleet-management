import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export function CreateBookingSkeleton() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-xl ring-1 ring-foreground/10">
            <div className="space-y-2 border-b px-4 py-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
