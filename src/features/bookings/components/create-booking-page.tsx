import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookingBreadcrumb } from '@/features/bookings/components/booking-breadcrumb';
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
        <BookingBreadcrumb current="Create Booking" />
        <PageHeader
          title="Create Booking"
          description="Create a new vehicle rental booking for the Silver Carz fleet."
        />
      </div>

      {vehiclesError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Vehicles unavailable</AlertTitle>
          <AlertDescription>
            {vehiclesError} You can still fill the form, but vehicle selection may be limited until
            this is resolved.
          </AlertDescription>
        </Alert>
      ) : null}

      <BookingForm
        mode="create"
        vehicles={vehicles}
        suggestedInvoiceNumber={suggestedInvoiceNumber}
      />
    </PageContainer>
  );
}
