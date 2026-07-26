'use client';

import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Row actions menu — View / Edit / Delete are UI placeholders until
 * detail and mutate flows land in later phases.
 */
export function BookingRowActions({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for booking ${invoiceNumber}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem disabled>View</DropdownMenuItem>
        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
