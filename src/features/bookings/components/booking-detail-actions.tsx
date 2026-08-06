'use client';

import { Ban, Check, Pencil, Printer } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { bookingEditPath, ROUTES } from '@/constants/routes';
import { approveBooking } from '@/features/bookings/actions/approve-booking';
import { deleteBooking } from '@/features/bookings/actions/delete-booking';
import { rejectBooking } from '@/features/bookings/actions/reject-booking';
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
 * Draft requests expose Approve / Cancel Request; confirmed bookings use Cancel Booking.
 */
export function BookingDetailActions({ bookingId, booking }: BookingDetailActionsProps) {
  const [isPending, startTransition] = useTransition();
  const display = resolveBookingDisplayStatus(booking);
  const isDraft = display === BOOKING_DISPLAY_STATUSES.draft;
  const isTerminal =
    display === BOOKING_DISPLAY_STATUSES.cancelled || display === BOOKING_DISPLAY_STATUSES.denied;

  const handleApproveRequest = () => {
    if (!isDraft) {
      return;
    }

    if (
      !window.confirm(
        'Approve this booking request? It will become a confirmed booking on the fleet calendar.',
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await approveBooking(bookingId);

      if (!result.success) {
        toast.error('Unable to approve request', { description: result.error.message });
        return;
      }

      toast.success('Request approved', {
        description: `Invoice ${result.data.invoice_number} is now a confirmed booking.`,
      });
      window.location.assign(ROUTES.bookingsConfirmed);
    });
  };

  const handleCancelRequest = () => {
    if (!isDraft) {
      return;
    }

    if (
      !window.confirm(
        'Deny this booking request? It will be labeled Denied and kept only as historic proof.',
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await rejectBooking(bookingId);

      if (!result.success) {
        toast.error('Unable to deny request', { description: result.error.message });
        return;
      }

      toast.success('Request denied', {
        description: `Invoice ${result.data.invoice_number} was marked as Denied.`,
      });
      window.location.assign(ROUTES.bookings);
    });
  };

  const handleCancelBooking = () => {
    if (isTerminal || isDraft) {
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
      // Full navigation avoids soft-nav loops that leave the action bar stuck.
      window.location.assign(ROUTES.bookings);
    });
  };

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
      role="toolbar"
      aria-label="Booking actions"
    >
      {isDraft ? (
        <>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            aria-busy={isPending}
            onClick={handleApproveRequest}
            aria-label="Approve booking request"
          >
            <Check className="size-4" aria-hidden="true" />
            Approve Request
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={isPending}
            aria-busy={isPending}
            onClick={handleCancelRequest}
            aria-label="Cancel booking request"
          >
            <Ban className="size-4" aria-hidden="true" />
            Cancel Request
          </Button>
        </>
      ) : null}

      {!isTerminal ? (
        <Button asChild size="sm" variant={isDraft ? 'outline' : 'default'}>
          <Link href={bookingEditPath(bookingId)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit Booking
          </Link>
        </Button>
      ) : (
        <Button size="sm" disabled aria-disabled="true">
          <Pencil className="size-4" aria-hidden="true" />
          Edit Booking
        </Button>
      )}

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.bookings}>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Bookings</span>
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        aria-disabled="true"
        title="Invoice printing will be available in a future release"
      >
        <Printer className="size-4" aria-hidden="true" />
        <span className="sm:hidden">Print</span>
        <span className="hidden sm:inline">Print Invoice</span>
      </Button>

      {!isDraft ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive"
          disabled={isPending || isTerminal}
          aria-busy={isPending}
          onClick={handleCancelBooking}
          aria-label="Cancel booking"
        >
          <Ban className="size-4" aria-hidden="true" />
          {isTerminal ? (
            display === BOOKING_DISPLAY_STATUSES.denied ? (
              'Denied'
            ) : (
              'Cancelled'
            )
          ) : (
            <>
              <span className="sm:hidden">Cancel</span>
              <span className="hidden sm:inline">Cancel Booking</span>
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
