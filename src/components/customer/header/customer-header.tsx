import Link from 'next/link';

import { CustomerMobileNav } from '@/components/customer/navigation/customer-mobile-nav';
import { CustomerNavLink } from '@/components/customer/navigation/customer-nav-link';
import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { appConfig, customerMainNavItems } from '@/config';
import { ROUTES } from '@/constants/routes';

/**
 * Customer portal header.
 * Four primary pages + Book Now CTA (both Book a Car and Book Now → `/`).
 */
export function CustomerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-secondary text-secondary-foreground">
      <CustomerContainer className="flex h-16 items-center gap-3 sm:h-[4.25rem]">
        <Link href={ROUTES.home} className="min-w-0 shrink-0">
          <span className="block truncate text-base font-bold tracking-wide uppercase sm:text-lg">
            {appConfig.companyName}
            <span className="text-primary">.</span>
          </span>
          <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.18em] text-primary uppercase sm:text-[10px]">
            Self Drive Car Rental
          </span>
        </Link>

        <nav
          className="mx-auto hidden items-center justify-center gap-5 lg:flex xl:gap-7"
          aria-label="Primary"
        >
          {customerMainNavItems.map((item) => (
            <CustomerNavLink key={`${item.title}-${item.href}`} item={item} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            className="hidden h-10 rounded-md bg-primary px-4 font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary/90 sm:inline-flex"
          >
            <Link href={ROUTES.bookACar}>Book Now</Link>
          </Button>
          <CustomerMobileNav />
        </div>
      </CustomerContainer>
    </header>
  );
}
