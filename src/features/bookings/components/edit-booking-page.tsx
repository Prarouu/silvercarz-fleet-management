import Link from 'next/link';

import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={ROUTES.bookings}>Bookings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Booking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.bookings}>Back to Bookings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {vehiclesError ? (
        <p className="text-sm text-destructive" role="alert">
          {vehiclesError}
        </p>
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
