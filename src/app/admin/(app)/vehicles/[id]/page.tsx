import { notFound } from 'next/navigation';

import { countBookings, listBookings } from '@/features/bookings/actions/list-bookings';
import { getVehicle } from '@/features/vehicles/actions/get-vehicle';
import { VehicleDetailPage } from '@/features/vehicles/components/vehicle-detail-page';
import { VEHICLE_ERROR_CODES } from '@/features/vehicles/errors';
import type { BookingWithVehicle } from '@/types';

/** Recent activity window for the fleet profile bookings section. */
const RECENT_BOOKINGS_PAGE_SIZE = 5;

type VehicleDetailRouteProps = {
  readonly params: Promise<{ id: string }>;
};

async function loadVehicleBookings(vehicleId: string): Promise<{
  readonly bookings: readonly BookingWithVehicle[];
  readonly totalBookings: number | null;
  readonly bookingsLoadError: string | null;
}> {
  const [listResponse, countResponse] = await Promise.all([
    listBookings({
      vehicleId,
      page: 1,
      pageSize: RECENT_BOOKINGS_PAGE_SIZE,
      sortBy: 'created_at',
      sortOrder: 'desc',
      includeCancelled: true,
    }),
    countBookings({ vehicleId, includeCancelled: true }),
  ]);

  if (!listResponse.success) {
    return {
      bookings: [],
      // Keep the count when available even if the recent list fails.
      totalBookings: countResponse.success ? countResponse.data : null,
      bookingsLoadError: listResponse.error.message || 'Unable to load booking history.',
    };
  }

  return {
    bookings: listResponse.data.data,
    totalBookings: countResponse.success ? countResponse.data : null,
    bookingsLoadError: null,
  };
}

export default async function VehicleDetailRoute({ params }: VehicleDetailRouteProps) {
  const { id } = await params;
  const response = await getVehicle(id);

  if (!response.success) {
    if (response.error.code === VEHICLE_ERROR_CODES.notFound) {
      notFound();
    }

    return (
      <VehicleDetailPage loadError={response.error.message || 'Unable to load this vehicle.'} />
    );
  }

  const { bookings, totalBookings, bookingsLoadError } = await loadVehicleBookings(id);

  return (
    <VehicleDetailPage
      vehicle={response.data}
      recentBookings={bookings}
      totalBookings={totalBookings}
      bookingsLoadError={bookingsLoadError}
    />
  );
}
