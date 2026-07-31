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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[8.5rem] flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="mt-auto space-y-1">
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-3xl border p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3 rounded-3xl border p-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="space-y-3 rounded-3xl border bg-card p-3">
        <div className="space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-2 sm:gap-3">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <Skeleton className="h-14 w-36 shrink-0 rounded-md sm:w-44" />
            <Skeleton className="h-14 min-w-0 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
