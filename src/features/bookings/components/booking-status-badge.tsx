import { Badge } from '@/components/ui/badge';
import {
  getBookingStatusPresentation,
  type BookingStatusInput,
} from '@/features/bookings/service/status.service';
import { cn } from '@/lib/utils';

type BookingStatusBadgeProps = {
  readonly booking: BookingStatusInput;
  readonly className?: string;
};

/**
 * Display badge from the Booking Status Automation Engine.
 * Never compute lifecycle status in UI — pass booking dates + stored status.
 */
export function BookingStatusBadge({ booking, className }: BookingStatusBadgeProps) {
  const presentation = getBookingStatusPresentation(booking);

  return (
    <Badge
      variant={presentation.badgeVariant}
      className={cn('font-medium tracking-wide', className)}
      aria-label={`Status: ${presentation.label}`}
    >
      {presentation.label}
    </Badge>
  );
}
