import Link from 'next/link';

import { CustomerContainer } from '@/components/customer/shared/customer-container';
import {
  appConfig,
  customerLegalNavItems,
  customerMainNavItems,
  customerQuickLinkItems,
} from '@/config';
import { ROUTES } from '@/constants/routes';

/**
 * Customer portal footer foundation.
 * Uses only company identity already present in config — no invented contact data.
 */
export function CustomerFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground">
      <CustomerContainer className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-14">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href={ROUTES.home} className="inline-block">
            <span className="block text-lg font-bold tracking-wide uppercase">
              {appConfig.companyName}
              <span className="text-primary">.</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
              Self Drive Car Rental
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary-foreground/70">
            {appConfig.companyName} provides self-drive car rental for customers who want a reliable
            fleet and a simple booking experience.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wide text-primary uppercase">Quick Links</h2>
          <ul className="mt-4 space-y-2.5">
            {customerQuickLinkItems.map((item) => (
              <li key={`quick-${item.href}-${item.title}`}>
                <Link
                  href={item.href}
                  className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wide text-primary uppercase">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {customerMainNavItems.map((item) => (
              <li key={`explore-${item.href}`}>
                <Link
                  href={item.href}
                  className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wide text-primary uppercase">Contact Us</h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-foreground/70">
            Reach the team through the{' '}
            <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
              Contact
            </Link>{' '}
            page. Business contact details will be published here when available.
          </p>
          <h2 className="mt-8 text-sm font-bold tracking-wide text-primary uppercase">Follow Us</h2>
          <p className="mt-3 text-sm text-secondary-foreground/70">Social links coming soon.</p>
        </div>
      </CustomerContainer>

      <div className="border-t border-white/10">
        <CustomerContainer className="flex flex-col gap-3 py-4 text-xs text-secondary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {appConfig.companyName}. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {customerLegalNavItems.map((item, index) => (
              <span key={item.title} className="inline-flex items-center gap-3">
                {index > 0 ? <span aria-hidden="true">|</span> : null}
                <Link href={item.href} className="transition-colors hover:text-primary">
                  {item.title}
                </Link>
              </span>
            ))}
          </div>
        </CustomerContainer>
      </div>
    </footer>
  );
}
