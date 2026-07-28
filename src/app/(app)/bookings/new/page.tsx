import { getBookingService } from '@/features/bookings/service';
import { CreateBookingPage } from '@/features/bookings/components/create-booking-page';
import { listVehicles } from '@/features/vehicles/actions/list-vehicles';

export default async function NewBookingPage() {
  const [vehiclesResponse, previewInvoiceNumber] = await Promise.all([
    listVehicles({
      isActive: true,
      available: true,
      pageSize: 100,
      sortBy: 'vehicle_name',
      sortOrder: 'asc',
    }),
    getBookingService()
      .previewNextInvoiceNumber()
      .catch(() => ''),
  ]);

  const vehicles = vehiclesResponse.success
    ? vehiclesResponse.data.data.map((vehicle) => ({
        id: vehicle.id,
        vehicle_name: vehicle.vehicle_name,
        vehicle_number: vehicle.vehicle_number,
        availability_status: vehicle.availability_status,
        is_active: vehicle.is_active,
        disabled: false,
      }))
    : [];

  return (
    <CreateBookingPage
      vehicles={vehicles}
      suggestedInvoiceNumber={previewInvoiceNumber || undefined}
      vehiclesError={
        vehiclesResponse.success
          ? undefined
          : vehiclesResponse.error.message || 'Unable to load vehicles.'
      }
    />
  );
}
