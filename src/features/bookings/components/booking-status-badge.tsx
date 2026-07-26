import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<BookingStatus, string> = {
  draft: 'border-border/60 bg-muted text-muted-foreground',
  confirmed: 'border-primary/20 bg-primary/10 text-primary',
  ongoing: 'border-amber-500/25 bg-amber-500/15 text-amber-800 dark:text-amber-300',
  completed: 'border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  cancelled: 'border-destructive/25 bg-destructive/10 text-destructive',
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const label = BOOKING_STATUS_LABELS[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium tracking-wide', STATUS_CLASS[status], className)}
      aria-label={`Status: ${label}`}
    >
      {label}
    </Badge>
  );
}
