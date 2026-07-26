import { notFound } from 'next/navigation';

import { getBooking } from '@/features/bookings/actions/get-booking';
import { EditBookingPage } from '@/features/bookings/components/edit-booking-page';
import { BOOKING_ERROR_CODES } from '@/features/bookings/errors';
import type { VehicleSelectOption } from '@/features/bookings/lib/booking-form';
import { getVehicle } from '@/features/vehicles/actions/get-vehicle';
import { listVehicles } from '@/features/vehicles/actions/list-vehicles';

type EditBookingRouteProps = {
  readonly params: Promise<{ id: string }>;
};

function toVehicleOption(vehicle: {
  id: string;
  vehicle_name: string;
  vehicle_number: string;
}): VehicleSelectOption {
  return {
    id: vehicle.id,
    vehicle_name: vehicle.vehicle_name,
    vehicle_number: vehicle.vehicle_number,
  };
}

export default async function EditBookingRoute({ params }: EditBookingRouteProps) {
  const { id } = await params;

  const [bookingResponse, vehiclesResponse] = await Promise.all([
    getBooking(id),
    listVehicles({
      isActive: true,
      pageSize: 100,
      sortBy: 'vehicle_name',
      sortOrder: 'asc',
    }),
  ]);

  if (!bookingResponse.success) {
    if (bookingResponse.error.code === BOOKING_ERROR_CODES.notFound) {
      notFound();
    }

    return (
      <EditBookingPage
        vehicles={[]}
        loadError={bookingResponse.error.message || 'Unable to load this booking.'}
      />
    );
  }

  const booking = bookingResponse.data;

  let vehicles: VehicleSelectOption[] = vehiclesResponse.success
    ? vehiclesResponse.data.data.map(toVehicleOption)
    : [];

  if (!vehicles.some((vehicle) => vehicle.id === booking.vehicle_id)) {
    const currentVehicle = await getVehicle(booking.vehicle_id);
    if (currentVehicle.success) {
      vehicles = [toVehicleOption(currentVehicle.data), ...vehicles];
    }
  }

  return (
    <EditBookingPage
      booking={booking}
      vehicles={vehicles}
      vehiclesError={
        vehiclesResponse.success
          ? undefined
          : vehiclesResponse.error.message || 'Unable to load vehicles.'
      }
    />
  );
}
