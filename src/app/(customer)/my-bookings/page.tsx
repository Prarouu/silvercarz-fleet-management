import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config';
import { ROUTES } from '@/constants/routes';
import { listOwnCustomerBookings, MyBookingsList } from '@/features/customer-booking';
import { APP_ROLES, isStaff, requireCustomerAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: `My Bookings | ${appConfig.companyName}`,
  description: 'Your Silver Carz booking request history and review status.',
};

export const dynamic = 'force-dynamic';

export default async function MyBookingsPage() {
  const user = await requireCustomerAuth(ROUTES.myBookings);

  if (user.role !== APP_ROLES.customer) {
    return (
      <CustomerContainer className="max-w-2xl py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">My Bookings</h1>
        <div className="mt-3 h-1 w-12 bg-primary" aria-hidden="true" />
        <p className="mt-5 text-muted-foreground">
          Staff accounts manage bookings in the Admin Portal.
        </p>
        {isStaff(user) ? (
          <div className="mt-8">
            <Button asChild className="h-11 rounded-md bg-primary font-bold uppercase">
              <Link href={ROUTES.dashboard}>Admin dashboard</Link>
            </Button>
          </div>
        ) : null}
      </CustomerContainer>
    );
  }

  const result = await listOwnCustomerBookings();
  const bookings = result.success ? result.data : [];

  return (
    <Suspense fallback={null}>
      <MyBookingsList bookings={bookings} />
    </Suspense>
  );
}
