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
import { bookingEditPath } from '@/constants/routes';

/**
 * Row actions menu — View / Delete remain placeholders until detail
 * and delete flows land. Edit navigates to the shared BookingForm.
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
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem disabled>View</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={bookingEditPath(bookingId)}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
