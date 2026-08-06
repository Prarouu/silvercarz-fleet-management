import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { BookingProgressSteps } from '@/components/customer/book-a-car/booking-progress-steps';
import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config';
import { customerBookingDocumentsPath, customerBookingPath, ROUTES } from '@/constants/routes';
import {
  BookingRequestPending,
  getOwnCustomerBookingWithVehicle,
} from '@/features/customer-booking';
import { APP_ROLES, requireCustomerAuth } from '@/lib/auth';
import { BOOKING_STATUS_LABELS, BOOKING_STATUSES } from '@/types/enums';

export const metadata: Metadata = {
  title: `Booking request | ${appConfig.companyName}`,
  description: 'Your Silver Carz booking request status.',
};

export const dynamic = 'force-dynamic';

/**
 * Customer booking request detail — Pending Approval after documents (C4).
 */
export default async function CustomerBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const nextPath = customerBookingPath(bookingId);
  const user = await requireCustomerAuth(nextPath);

  if (user.role !== APP_ROLES.customer) {
    return (
      <>
        <BookingProgressSteps activeStep={5} />
        <CustomerContainer className="max-w-2xl py-10 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Customer account required
          </h1>
          <p className="mt-5 text-muted-foreground">
            Staff can review booking requests in the Admin Portal.
          </p>
          <div className="mt-8">
            <Button asChild className="h-11 rounded-md bg-primary font-bold uppercase">
              <Link href={ROUTES.bookings}>Admin bookings</Link>
            </Button>
          </div>
        </CustomerContainer>
      </>
    );
  }

  const result = await getOwnCustomerBookingWithVehicle(bookingId);

  if (!result.success) {
    notFound();
  }

  const booking = result.data;

  if (booking.status === BOOKING_STATUSES.draft && !booking.document_submitted) {
    redirect(customerBookingDocumentsPath(bookingId));
  }

  if (booking.status === BOOKING_STATUSES.draft) {
    return <BookingRequestPending booking={booking} />;
  }

  return (
    <>
      <BookingProgressSteps activeStep={5} />
      <CustomerContainer className="max-w-2xl py-10 sm:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Booking request
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground uppercase">
          {booking.invoice_number}
        </h1>
        <div className="mt-3 h-1 w-12 bg-primary" aria-hidden="true" />
        <p className="mt-5 text-base text-muted-foreground">
          Status:{' '}
          <span className="font-semibold text-foreground">
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </p>
        <div className="mt-8">
          <Button asChild variant="outline" className="h-11 rounded-md">
            <Link href={ROUTES.bookACar}>Back to Book a Car</Link>
          </Button>
        </div>
      </CustomerContainer>
    </>
  );
}
