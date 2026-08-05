'use client';

import { RotateCw, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BookingListRefreshButtonProps = {
  readonly label?: string;
  /** When true, navigates to clearHref or the bare bookings path. */
  readonly clearFilters?: boolean;
  /** Optional destination when clearing filters (preserves the active queue). */
  readonly clearHref?: string;
  readonly variant?: 'outline' | 'ghost' | 'default';
  readonly size?: 'default' | 'sm';
};

export function BookingListRefreshButton({
  label = 'Refresh',
  clearFilters = false,
  clearHref,
  variant = 'outline',
  size = 'sm',
}: BookingListRefreshButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          if (clearFilters) {
            router.push(clearHref ?? pathname);
            return;
          }
          router.refresh();
        });
      }}
    >
      {clearFilters ? (
        <X className="size-4" />
      ) : (
        <RotateCw className={cn('size-4', isPending && 'animate-spin')} />
      )}
      {label}
    </Button>
  );
}
