'use client';

import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { vehicleDetailPath, vehicleEditPath } from '@/constants/routes';

/**
 * Row actions menu — View / Edit navigate to future vehicle routes.
 * Deactivate and Delete remain placeholders until those flows land.
 */
export function VehicleRowActions({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${vehicleName}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link href={vehicleDetailPath(vehicleId)}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={vehicleEditPath(vehicleId)}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Deactivate</DropdownMenuItem>
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
