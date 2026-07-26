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
import { signOutAction } from '@/features/auth/actions/sign-out';
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
  const segments = localPart.split(/[._-]/).filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[0]![0]!}${segments[1]![0]!}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

interface UserMenuProps {
  readonly user: AuthUser;
}

/**
 * Header user menu showing the authenticated account and sign-out action.
 */
export function UserMenu({ user }: UserMenuProps) {
  const email = user.email ?? 'Signed in';
  const displayName = user.fullName?.trim() || 'Signed in';
  const initials = getInitials(user.fullName, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
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
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
