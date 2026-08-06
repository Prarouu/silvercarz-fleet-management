'use client';

import { Ban, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { approveBooking } from '@/features/bookings/actions/approve-booking';
import { rejectBooking } from '@/features/bookings/actions/reject-booking';

type BookingRequestActionsProps = {
  readonly bookingId: string;
  readonly invoiceNumber: string;
};

/**
 * Approve / Cancel Request controls for pending draft booking requests.
 */
export function BookingRequestActions({ bookingId, invoiceNumber }: BookingRequestActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (
      !window.confirm(
        `Approve request ${invoiceNumber}? It will become a confirmed booking on the fleet calendar.`,
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
      router.refresh();
    });
  };

  const handleCancel = () => {
    if (
      !window.confirm(
        `Deny request ${invoiceNumber}? It will be labeled Denied and kept only as historic proof.`,
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
      router.refresh();
    });
  };

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      role="group"
      aria-label="Request actions"
    >
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleApprove}
        aria-label={`Approve request ${invoiceNumber}`}
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
        onClick={handleCancel}
        aria-label={`Cancel request ${invoiceNumber}`}
      >
        <Ban className="size-4" aria-hidden="true" />
        Cancel Request
      </Button>
    </div>
  );
}
