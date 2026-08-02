'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { customerSignOutAction } from '@/features/customer-auth/actions/sign-out';
import type { AuthUser } from '@/lib/auth/types';

function getInitials(fullName: string | null, email: string | undefined): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }

  if (!email) {
    return 'SC';
  }

  const localPart = email.split('@')[0] ?? email;
  return localPart.slice(0, 2).toUpperCase();
}

interface CustomerAccountMenuProps {
  readonly user: AuthUser;
}

/**
 * Authenticated customer account control for the portal header.
 */
export function CustomerAccountMenu({ user }: CustomerAccountMenuProps) {
  const email = user.email ?? 'Signed in';
  const displayName = user.fullName?.trim() || email;
  const initials = getInitials(user.fullName, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-2 rounded-md px-2 text-secondary-foreground hover:bg-white/10 hover:text-primary"
          aria-label="Account menu"
        >
          <Avatar className="size-8 border border-white/20">
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="grid leading-tight">
            <span className="font-medium">{displayName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.myBookings}>My Bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={customerSignOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
