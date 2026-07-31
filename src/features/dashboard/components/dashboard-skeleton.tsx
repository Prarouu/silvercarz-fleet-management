import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/shared/page-container';

/** Route-level skeleton — mirrors dashboard layout to avoid shift. */
export function DashboardSkeleton() {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-none ring-0">
          <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="w-full space-y-2.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-80 max-w-full sm:h-10" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-2/3 max-w-md" />
            </div>
            <Skeleton className="h-20 w-36 shrink-0 rounded-2xl" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[9.5rem] flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-border sm:min-h-[10.5rem] sm:gap-6 sm:p-6"
            >
              <Skeleton className="size-9 rounded-lg" />
              <div className="mt-auto space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-none">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
