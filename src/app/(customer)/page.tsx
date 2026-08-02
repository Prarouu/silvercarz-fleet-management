import type { Metadata } from 'next';
import Link from 'next/link';

import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: `${appConfig.companyName} | Self Drive Car Rental`,
  description: 'Book Silver Carz fleet vehicles online.',
};

/**
 * Customer landing foundation (C0).
 * Validates theme + chrome. Full marketing home lands in a later phase.
 */
export default function CustomerHomePage() {
  return (
    <section className="relative overflow-hidden bg-tone-ink text-tone-ink-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(244_180_0_/_0.18),transparent_45%),linear-gradient(to_bottom,#111111,#0a0a0a)]"
      />
      <CustomerContainer className="relative flex min-h-[min(70svh,40rem)] flex-col justify-center py-16 sm:py-24">
        <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
          {appConfig.companyName}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl">
          Drive your journey your <span className="text-primary">way</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/75 sm:text-lg">
          Premium self-drive rentals. Browse the fleet, request a booking, and manage your trips —
          customer portal foundation is live.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 rounded-md bg-primary px-5 font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary/90"
          >
            <Link href={ROUTES.bookACar}>Explore Cars</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-md border-white/25 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={ROUTES.about}>About Us</Link>
          </Button>
        </div>
        <p className="mt-10 text-xs text-white/45">
          Phase C0 — architecture & visual foundation. Booking flows arrive in later phases.
        </p>
      </CustomerContainer>
    </section>
  );
}
