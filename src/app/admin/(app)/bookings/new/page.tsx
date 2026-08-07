import { getBookingService } from '@/features/bookings/service';
import { CreateBookingPage } from '@/features/bookings/components/create-booking-page';
import { listVehicles } from '@/features/vehicles/actions';

export default async function NewBookingPage() {
  // Availability is kept fresh on booking write paths — no fleet-wide sync on read.
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
        image_path: vehicle.image_path,
        availability_status: vehicle.availability_status,
        is_active: vehicle.is_active,
        default_daily_rate: vehicle.default_daily_rate,
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
