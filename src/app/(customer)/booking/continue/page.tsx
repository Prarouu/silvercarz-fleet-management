import type { Metadata } from 'next';
import Link from 'next/link';

import { BookingProgressSteps } from '@/components/customer/book-a-car/booking-progress-steps';
import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config';
import { customerBookingContinuePath, ROUTES } from '@/constants/routes';
import { getPublicVehicle } from '@/features/vehicles/actions/list-public-vehicles';
import { VehicleThumbnail } from '@/features/vehicles/components/vehicle-thumbnail';
import { requireCustomerAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';
import { FUEL_TYPE_LABELS, TRANSMISSION_TYPE_LABELS } from '@/types/enums';

export const metadata: Metadata = {
  title: `Booking details | ${appConfig.companyName}`,
  description: 'Continue your Silver Carz booking after vehicle selection.',
};

export const dynamic = 'force-dynamic';

/**
 * C2 authenticated booking-flow placeholder.
 * Preserves the selected vehicle. Does not create a booking record.
 */
export default async function BookingContinuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const vehicleId = firstParam(params.vehicle);
  const nextPath = vehicleId ? customerBookingContinuePath(vehicleId) : ROUTES.bookingContinue;

  await requireCustomerAuth(nextPath);

  const vehicleResult = vehicleId ? await getPublicVehicle(vehicleId) : null;
  const vehicle = vehicleResult?.success ? vehicleResult.data : null;

  return (
    <>
      <BookingProgressSteps activeStep={2} />

      <CustomerContainer className="max-w-2xl py-10 sm:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Booking · Step 2
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          Booking details
        </h1>
        <div className="mt-3 h-1 w-12 bg-primary" aria-hidden="true" />
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          You’re signed in and your selected car is ready. Booking details, documents, and payment
          arrive in the next phase — no booking has been created yet.
        </p>

        {vehicle ? (
          <div className="mt-8 flex gap-4 rounded-lg border border-border bg-card p-4">
            <VehicleThumbnail
              imagePath={vehicle.image_path}
              alt={vehicle.vehicle_name}
              fit="contain"
              className="h-20 w-28 rounded-md bg-surface-secondary"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-foreground">{vehicle.vehicle_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {FUEL_TYPE_LABELS[vehicle.fuel_type]} ·{' '}
                {TRANSMISSION_TYPE_LABELS[vehicle.transmission_type]}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatCurrency(Number(vehicle.default_daily_rate), { maximumFractionDigits: 0 })}{' '}
                /day
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
            No vehicle was selected. Choose a car on Book a Car to continue.
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 rounded-md bg-primary font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary/90"
          >
            <Link href={vehicle ? `/?vehicle=${vehicle.id}` : ROUTES.bookACar}>
              {vehicle ? 'Change car' : 'Browse cars'}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-md">
            <Link href={ROUTES.home}>Back to Book a Car</Link>
          </Button>
        </div>
      </CustomerContainer>
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
