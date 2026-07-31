import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

function DetailCardSkeleton({ fields = 6 }: { readonly fields?: number }) {
  return (
    <div className="space-y-4 rounded-xl ring-1 ring-foreground/10">
      <div className="space-y-2 border-b px-4 py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching the Vehicle Details (fleet profile) layout. */
export function VehicleDetailSkeleton() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4" aria-busy="true" aria-label="Loading vehicle details">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Skeleton className="h-9 w-full sm:h-8 sm:w-28" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-32" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-36" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-32" />
        </div>
      </div>

      <div className="space-y-4 rounded-xl ring-1 ring-foreground/10">
        <div className="space-y-2 border-b px-4 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="grid gap-6 px-4 pb-4 md:grid-cols-[minmax(0,16rem)_1fr]">
          <Skeleton className="aspect-[4/3] w-full rounded-xl sm:aspect-square" />
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="mt-auto space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="hidden h-3 w-32 sm:block" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <DetailCardSkeleton fields={8} />
        <DetailCardSkeleton fields={4} />
      </div>

      <DetailCardSkeleton fields={3} />
      <DetailCardSkeleton fields={4} />
      <DetailCardSkeleton fields={3} />
    </PageContainer>
  );
}
