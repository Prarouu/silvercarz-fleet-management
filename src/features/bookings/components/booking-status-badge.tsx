import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<BookingStatus, string> = {
  draft: 'border-transparent bg-muted text-muted-foreground',
  confirmed: 'border-transparent bg-primary/10 text-primary',
  ongoing: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
  completed: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  cancelled: 'border-transparent bg-destructive/10 text-destructive',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_CLASS[status])}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
