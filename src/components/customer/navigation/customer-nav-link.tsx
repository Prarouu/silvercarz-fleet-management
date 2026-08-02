'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { CustomerNavItem } from '@/config';
import { cn } from '@/lib/utils';

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerNavLink({
  item,
  onNavigate,
  className,
}: {
  item: CustomerNavItem;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'text-sm font-semibold tracking-wide uppercase transition-colors',
        active ? 'text-primary' : 'text-secondary-foreground/90 hover:text-primary',
        className,
      )}
      aria-current={active ? 'page' : undefined}
    >
      {item.title}
    </Link>
  );
}
