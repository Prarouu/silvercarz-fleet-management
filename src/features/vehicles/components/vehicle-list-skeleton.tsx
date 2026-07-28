import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/shared/skeletons';

/** Loading placeholder matching the fleet list layout (avoids layout shift). */
export function VehicleListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading fleet">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 max-w-full sm:w-80" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-7 w-14" />
              </div>
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <TableSkeleton rows={8} columns={7} />
      </div>

      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t pt-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
