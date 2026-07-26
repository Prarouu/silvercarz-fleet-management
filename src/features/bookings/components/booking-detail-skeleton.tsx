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

/** Skeleton matching the Booking Details workspace layout. */
export function BookingDetailSkeleton() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4" aria-busy="true" aria-label="Loading booking details">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl sm:w-40" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Skeleton className="h-9 w-full sm:h-8 sm:w-28" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-36" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-28" />
          <Skeleton className="h-9 w-full sm:h-8 sm:w-32" />
        </div>
      </div>

      <DetailCardSkeleton fields={7} />

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <DetailCardSkeleton fields={6} />
        <DetailCardSkeleton fields={4} />
        <DetailCardSkeleton fields={8} />
        <DetailCardSkeleton fields={6} />
      </div>

      <DetailCardSkeleton fields={1} />
      <DetailCardSkeleton fields={2} />
    </PageContainer>
  );
}
