'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAGINATION } from '@/constants';
import {
  buildBookingListSearchParams,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import type { PaginationMeta } from '@/types';
import { cn } from '@/lib/utils';

type BookingListPaginationProps = {
  readonly state: BookingListUrlState;
  readonly meta: PaginationMeta;
  readonly className?: string;
};

function buildPageNumbers(current: number, total: number): number[] {
  if (total <= 0) {
    return [];
  }

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export function BookingListPagination({ state, meta, className }: BookingListPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(updates: Partial<BookingListUrlState>) {
    const query = buildBookingListSearchParams(state, updates);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  const pageNumbers = buildPageNumbers(meta.page, meta.totalPages);
  const from = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.totalItems);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        isPending && 'opacity-80',
        className,
      )}
      aria-busy={isPending}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.totalItems === 0
          ? 'No records'
          : `Showing ${from}–${to} of ${meta.totalItems} bookings`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap text-muted-foreground">Rows per page</span>
          <Select
            value={String(state.pageSize)}
            onValueChange={(value) =>
              navigate({
                pageSize: Number.parseInt(value ?? String(PAGINATION.defaultPageSize), 10),
                page: 1,
              })
            }
          >
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION.pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!meta.hasPreviousPage}
            onClick={() => navigate({ page: meta.page - 1 })}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pageNumbers.map((page, index) => {
            const previous = pageNumbers[index - 1];
            const showEllipsis = previous !== undefined && page - previous > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-1 text-sm text-muted-foreground" aria-hidden="true">
                    …
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant={page === meta.page ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => navigate({ page })}
                  aria-label={`Page ${page}`}
                  aria-current={page === meta.page ? 'page' : undefined}
                >
                  {page}
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!meta.hasNextPage}
            onClick={() => navigate({ page: meta.page + 1 })}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
