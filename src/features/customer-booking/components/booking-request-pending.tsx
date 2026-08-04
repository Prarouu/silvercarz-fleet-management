import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { BookingProgressSteps } from '@/components/customer/book-a-car/booking-progress-steps';
import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { SelectedVehicleSummary } from '@/features/customer-booking/components/selected-vehicle-summary';
import { calculateRentalDays } from '@/features/customer-booking/lib/estimate';
import { formatCurrency, formatDate } from '@/lib/format';
import type { BookingWithVehicle } from '@/types';
import { RENTAL_MODE_LABELS } from '@/types/enums';

export function BookingRequestPending({ booking }: { readonly booking: BookingWithVehicle }) {
  const durationDays =
    booking.duration != null
      ? Number(booking.duration)
      : calculateRentalDays(booking.delivery_date, booking.return_date);

  return (
    <>
      <BookingProgressSteps activeStep={4} />

      <CustomerContainer className="max-w-3xl py-10 sm:py-14">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 size-8 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Request submitted
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              Booking request submitted
            </h1>
            <div className="mt-3 h-1 w-12 bg-primary" aria-hidden="true" />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Your request has been sent to Silver Carz for approval. We’ll confirm availability and
              next steps — this is not a confirmed booking yet.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Booking request number
              </p>
              <p className="mt-1 text-xl font-bold tracking-wide text-foreground">
                {booking.invoice_number}
              </p>
            </div>
            <span className="rounded-md bg-tone-gold px-3 py-1.5 text-xs font-bold tracking-wide text-tone-gold-foreground uppercase">
              Pending approval
            </span>
          </div>

          <SelectedVehicleSummary vehicle={booking.vehicle} />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Pickup
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatDate(booking.delivery_date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Return
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatDate(booking.return_date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Duration
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {durationDays} {durationDays === 1 ? 'day' : 'days'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Mode
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {RENTAL_MODE_LABELS[booking.mode]}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Estimated total
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                {formatCurrency(Number(booking.total_amount), { maximumFractionDigits: 0 })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 rounded-md bg-primary font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary/90"
          >
            <Link href={ROUTES.bookACar}>Browse more cars</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-md border-secondary text-secondary"
          >
            <Link href={ROUTES.myBookings}>My bookings</Link>
          </Button>
        </div>
      </CustomerContainer>
    </>
  );
}
