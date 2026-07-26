import { CalendarPlus, FileText } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { VehicleDetailSection } from '@/features/vehicles/components/vehicle-detail-section';
import { VehicleRecentBookingsTable } from '@/features/vehicles/components/vehicle-recent-bookings-table';
import type { BookingWithVehicle } from '@/types';

type VehicleRecentBookingsProps = {
  readonly bookings: readonly BookingWithVehicle[];
  /** Soft failure when booking history could not be loaded. */
  readonly loadError?: string | null;
};

/** Recent booking activity for a vehicle, with a professional empty state. */
export function VehicleRecentBookings({ bookings, loadError }: VehicleRecentBookingsProps) {
  return (
    <VehicleDetailSection
      title="Recent Bookings"
      description="Latest hire activity linked to this vehicle."
      headerAction={
        bookings.length > 0 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.bookingsNew}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Create Booking
            </Link>
          </Button>
        ) : null
      }
    >
      {loadError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Unable to load bookings</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {!loadError && bookings.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No bookings yet"
          description="No bookings have been created for this vehicle yet."
          action={
            <Button asChild size="sm">
              <Link href={ROUTES.bookingsNew}>
                <CalendarPlus className="size-4" aria-hidden="true" />
                Create Booking
              </Link>
            </Button>
          }
        />
      ) : null}

      {!loadError && bookings.length > 0 ? (
        <VehicleRecentBookingsTable bookings={bookings} />
      ) : null}
    </VehicleDetailSection>
  );
}
