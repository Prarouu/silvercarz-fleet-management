import Link from 'next/link';

import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ROUTES } from '@/constants/routes';
import { BookingForm } from '@/features/bookings/components/booking-form';
import type { VehicleSelectOption } from '@/features/bookings/lib/booking-form';

type CreateBookingPageProps = {
  readonly vehicles: readonly VehicleSelectOption[];
  readonly suggestedInvoiceNumber?: string;
  readonly vehiclesError?: string;
};

export function CreateBookingPage({
  vehicles,
  suggestedInvoiceNumber,
  vehiclesError,
}: CreateBookingPageProps) {
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
              <BreadcrumbPage>Create Booking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader title="Create Booking" description="Create a new vehicle rental booking." />
      </div>

      {vehiclesError ? (
        <p className="text-sm text-destructive" role="alert">
          {vehiclesError}
        </p>
      ) : null}

      <BookingForm
        mode="create"
        vehicles={vehicles}
        suggestedInvoiceNumber={suggestedInvoiceNumber}
      />
    </PageContainer>
  );
}
