'use client';

import { Ban, Pencil, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { bookingEditPath, ROUTES } from '@/constants/routes';
import { deleteBooking } from '@/features/bookings/actions/delete-booking';
import {
  BOOKING_DISPLAY_STATUSES,
  resolveBookingDisplayStatus,
  type BookingStatusInput,
} from '@/features/bookings/service/status.service';

type BookingDetailActionsProps = {
  readonly bookingId: string;
  readonly booking: BookingStatusInput;
};

/**
 * Detail workspace action bar.
 * Lifecycle status is automatic; Cancel Booking is the terminal action.
 */
export function BookingDetailActions({ bookingId, booking }: BookingDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const display = resolveBookingDisplayStatus(booking);
  const isCancelled = display === BOOKING_DISPLAY_STATUSES.cancelled;

  const handleCancelBooking = () => {
    if (isCancelled) {
      return;
    }

    if (
      !window.confirm(
        'Cancel this booking? The vehicle will be released according to availability rules.',
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBooking(bookingId);

      if (!result.success) {
        toast.error('Unable to cancel booking', { description: result.error.message });
        return;
      }

      toast.success('Booking cancelled', {
        description: `Invoice ${result.data.invoice_number} was cancelled.`,
      });
      router.push(ROUTES.bookings);
      router.refresh();
    });
  };

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
      role="toolbar"
      aria-label="Booking actions"
    >
      {!isCancelled ? (
        <Button asChild size="sm" className="min-h-9 sm:min-h-8">
          <Link href={bookingEditPath(bookingId)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit Booking
          </Link>
        </Button>
      ) : (
        <Button size="sm" className="min-h-9 sm:min-h-8" disabled aria-disabled="true">
          <Pencil className="size-4" aria-hidden="true" />
          Edit Booking
        </Button>
      )}

      <Button asChild variant="outline" size="sm" className="min-h-9 sm:min-h-8">
        <Link href={ROUTES.bookings}>Back to Bookings</Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-9 sm:min-h-8"
        disabled
        aria-disabled="true"
        title="Invoice printing will be available in a future release"
      >
        <Printer className="size-4" aria-hidden="true" />
        Print Invoice
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-9 text-destructive sm:min-h-8"
        disabled={isPending || isCancelled}
        aria-busy={isPending}
        onClick={handleCancelBooking}
        aria-label="Cancel booking"
      >
        <Ban className="size-4" aria-hidden="true" />
        {isCancelled ? 'Cancelled' : 'Cancel Booking'}
      </Button>
    </div>
  );
}
