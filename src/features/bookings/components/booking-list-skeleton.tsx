import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/shared/skeletons';

/** Loading placeholder matching the bookings list layout (avoids layout shift). */
export function BookingListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading bookings">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-8 w-full sm:col-span-2 xl:col-span-1" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      <div className="hidden md:block">
        <TableSkeleton rows={8} columns={6} />
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
