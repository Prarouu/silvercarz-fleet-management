import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

function DetailCardSkeleton({ fields = 6 }: { readonly fields?: number }) {
  return (
    <div className="space-y-4 rounded-xl ring-1 ring-foreground/10">
      <div className="space-y-2 border-b px-4 py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
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
    <PageContainer>
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>

      <DetailCardSkeleton fields={7} />

      <div className="grid gap-6 lg:grid-cols-2">
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
