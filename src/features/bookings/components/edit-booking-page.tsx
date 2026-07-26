import Link from 'next/link';

import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BookingBreadcrumb } from '@/features/bookings/components/booking-breadcrumb';
import { BookingForm } from '@/features/bookings/components/booking-form';
import {
  bookingToFormValues,
  type VehicleSelectOption,
} from '@/features/bookings/lib/booking-form';
import type { Booking } from '@/types';

type EditBookingPageProps = {
  readonly booking?: Booking;
  readonly vehicles: readonly VehicleSelectOption[];
  readonly vehiclesError?: string;
  readonly loadError?: string;
};

export function EditBookingPage({
  booking,
  vehicles,
  vehiclesError,
  loadError,
}: EditBookingPageProps) {
  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4">
        <BookingBreadcrumb current="Edit Booking" />
        <PageHeader
          title="Edit Booking"
          description={
            booking
              ? `Update invoice ${booking.invoice_number}.`
              : 'Update an existing vehicle rental booking.'
          }
        />
      </div>

      {loadError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Booking unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={ROUTES.bookings}>Back to Bookings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {vehiclesError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Vehicles unavailable</AlertTitle>
          <AlertDescription>
            {vehiclesError} The current vehicle remains selectable when possible.
          </AlertDescription>
        </Alert>
      ) : null}

      {booking && !loadError ? (
        <BookingForm
          mode="edit"
          bookingId={booking.id}
          bookingStatus={booking.status}
          defaultValues={bookingToFormValues(booking)}
          vehicles={vehicles}
        />
      ) : null}
    </PageContainer>
  );
}
