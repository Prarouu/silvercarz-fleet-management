import { countBookings } from '@/features/bookings/actions/list-bookings';
import { CreateBookingPage } from '@/features/bookings/components/create-booking-page';
import { buildInvoiceNumberSuggestion } from '@/features/bookings/service/booking-calculations';
import { listVehicles } from '@/features/vehicles/actions/list-vehicles';

export default async function NewBookingPage() {
  const [vehiclesResponse, countResponse] = await Promise.all([
    listVehicles({
      isActive: true,
      available: true,
      pageSize: 100,
      sortBy: 'vehicle_name',
      sortOrder: 'asc',
    }),
    countBookings({ includeCancelled: true }),
  ]);

  const vehicles = vehiclesResponse.success
    ? vehiclesResponse.data.data.map((vehicle) => ({
        id: vehicle.id,
        vehicle_name: vehicle.vehicle_name,
        vehicle_number: vehicle.vehicle_number,
      }))
    : [];

  const sequence = countResponse.success ? countResponse.data + 1 : 1;
  const suggestedInvoiceNumber = buildInvoiceNumberSuggestion({
    sequence,
    issuedOn: new Date().toISOString().slice(0, 10),
  });

  return (
    <CreateBookingPage
      vehicles={vehicles}
      suggestedInvoiceNumber={suggestedInvoiceNumber}
      vehiclesError={
        vehiclesResponse.success
          ? undefined
          : vehiclesResponse.error.message || 'Unable to load vehicles.'
      }
    />
  );
}
