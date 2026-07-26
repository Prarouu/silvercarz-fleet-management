/**
 * Thin create-mode wrapper around the shared BookingForm.
 * Prefer importing `BookingForm` with `mode="create"` for new call sites.
 */

import { BookingForm } from '@/features/bookings/components/booking-form';
import type { VehicleSelectOption } from '@/features/bookings/lib/booking-form';

type CreateBookingFormProps = {
  readonly vehicles: readonly VehicleSelectOption[];
  readonly suggestedInvoiceNumber?: string;
  readonly className?: string;
};

export function CreateBookingForm({
  vehicles,
  suggestedInvoiceNumber,
  className,
}: CreateBookingFormProps) {
  return (
    <BookingForm
      mode="create"
      vehicles={vehicles}
      suggestedInvoiceNumber={suggestedInvoiceNumber}
      className={className}
    />
  );
}
