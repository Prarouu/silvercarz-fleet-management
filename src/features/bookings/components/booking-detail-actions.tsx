import { ArrowLeft, Pencil, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { bookingEditPath, ROUTES } from '@/constants/routes';

type BookingDetailActionsProps = {
  readonly bookingId: string;
};

/**
 * Detail workspace action bar.
 * Edit and Back are functional; Print Invoice and Delete remain placeholders.
 */
export function BookingDetailActions({ bookingId }: BookingDetailActionsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
      role="toolbar"
      aria-label="Booking actions"
    >
      <Button asChild size="sm" className="min-h-9 sm:min-h-8">
        <Link href={bookingEditPath(bookingId)}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit Booking
        </Link>
      </Button>

      <Button asChild variant="outline" size="sm" className="min-h-9 sm:min-h-8">
        <Link href={ROUTES.bookings}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Bookings
        </Link>
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
        disabled
        aria-disabled="true"
        title="Delete booking will be available in a future release"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Delete Booking
      </Button>
    </div>
  );
}
