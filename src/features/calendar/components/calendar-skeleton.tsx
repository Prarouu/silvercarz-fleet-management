import { CardSkeleton, TableSkeleton } from '@/components/shared/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

/** Loading placeholder matching the fleet calendar layout. */
export function CalendarSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading fleet calendar">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full sm:w-96" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="space-y-3 rounded-xl border p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3 rounded-xl border p-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="hidden md:block">
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      <div className="space-y-2 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />

      <div className="grid gap-6 lg:grid-cols-2">
        <TableSkeleton rows={4} columns={5} />
        <TableSkeleton rows={4} columns={5} />
      </div>
    </div>
  );
}
