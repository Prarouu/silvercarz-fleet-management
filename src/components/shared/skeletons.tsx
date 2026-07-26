import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder for a stat/content card while data loads. */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-7 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

/** Placeholder rows for tabular data while it loads. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 overflow-hidden rounded-xl border border-border">
      <div className="flex gap-3 border-b border-table-border bg-table-header px-3 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="space-y-3 px-3 pb-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-3">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className="h-8 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generic page placeholder: heading + card grid. */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
