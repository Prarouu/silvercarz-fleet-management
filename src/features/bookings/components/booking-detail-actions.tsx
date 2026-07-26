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
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Booking actions">
      <Button asChild size="sm">
        <Link href={bookingEditPath(bookingId)}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit Booking
        </Link>
      </Button>

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.bookings}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Bookings
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
        Print Invoice
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
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
