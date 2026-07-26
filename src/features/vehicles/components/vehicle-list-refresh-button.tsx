'use client';

import { RotateCw, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VehicleListRefreshButtonProps = {
  readonly label?: string;
  /** When true, navigates to the bare vehicles path (clears query params). */
  readonly clearFilters?: boolean;
  readonly variant?: 'outline' | 'ghost' | 'default';
  readonly size?: 'default' | 'sm';
};

export function VehicleListRefreshButton({
  label = 'Refresh',
  clearFilters = false,
  variant = 'outline',
  size = 'sm',
}: VehicleListRefreshButtonProps) {
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
            router.push(pathname);
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
