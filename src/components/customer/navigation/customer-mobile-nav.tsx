'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { CustomerNavLink } from '@/components/customer/navigation/customer-nav-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { appConfig, customerMainNavItems } from '@/config';
import { ROUTES } from '@/constants/routes';

/**
 * Mobile navigation — same four primary pages as desktop.
 */
export function CustomerMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-secondary-foreground hover:bg-white/10 hover:text-primary lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-secondary bg-secondary text-secondary-foreground"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-secondary-foreground">
            <span className="block text-base font-bold tracking-wide uppercase">
              {appConfig.companyName}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
              Self Drive Car Rental
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 px-4 pb-6" aria-label="Mobile">
          {customerMainNavItems.map((item) => (
            <CustomerNavLink
              key={`${item.title}-${item.href}`}
              item={item}
              onNavigate={() => setOpen(false)}
              className="py-1"
            />
          ))}
          <Button
            asChild
            className="mt-2 h-11 rounded-md bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Link href={ROUTES.bookACar} onClick={() => setOpen(false)}>
              Book Now
            </Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
