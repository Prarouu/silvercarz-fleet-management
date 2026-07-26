'use client';

import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bookingDetailPath, bookingEditPath } from '@/constants/routes';

/**
 * Row actions menu — View opens Booking Details, Edit opens BookingForm.
 * Delete remains a placeholder until the delete flow lands.
 */
export function BookingRowActions({
  bookingId,
  invoiceNumber,
}: {
  bookingId: string;
  invoiceNumber: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for booking ${invoiceNumber}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link href={bookingDetailPath(bookingId)}>View details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={bookingEditPath(bookingId)}>Edit booking</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
