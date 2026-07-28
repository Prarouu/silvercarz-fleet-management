import { FileText, StickyNote } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';
import { BookingBreadcrumb } from '@/features/bookings/components/booking-breadcrumb';
import { BookingDetailActions } from '@/features/bookings/components/booking-detail-actions';
import { BookingDetailField } from '@/features/bookings/components/booking-detail-field';
import { BookingDetailSection } from '@/features/bookings/components/booking-detail-section';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import { getBookingStatusPresentation } from '@/features/bookings/service/status.service';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import {
  FUEL_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  RENTAL_MODE_LABELS,
  type BookingWithVehicle,
} from '@/types';

type BookingDetailPageProps = {
  readonly booking?: BookingWithVehicle;
  readonly createdByLabel?: string | null;
  readonly loadError?: string;
};

function formatOptionalCurrency(amount: number | null | undefined): string {
  const formatted = formatCurrency(amount);
  return formatted || '—';
}

function formatOptionalNumber(value: number | null | undefined, suffix?: string): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const formatted = formatNumber(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatDuration(days: number | null | undefined): string {
  if (days === null || days === undefined) {
    return '—';
  }

  return days === 1 ? '1 day' : `${formatNumber(days)} days`;
}

export function BookingDetailPage({ booking, createdByLabel, loadError }: BookingDetailPageProps) {
  if (loadError || !booking) {
    return (
      <PageContainer className="max-w-5xl">
        <div className="space-y-4">
          <BookingBreadcrumb current="Booking Details" />
        </div>

        {loadError ? (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Unable to load booking</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={ROUTES.bookings}>Back to Bookings</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <EmptyState
            icon={FileText}
            title="Booking not found"
            description="This booking may have been removed, or you may not have permission to view it."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={ROUTES.bookings}>Return to Bookings</Link>
              </Button>
            }
          />
        )}
      </PageContainer>
    );
  }

  const notes = booking.notes?.trim() ?? '';
  const paymentMethodLabel = booking.payment_method
    ? PAYMENT_METHOD_LABELS[booking.payment_method]
    : null;
  const totalLabel = formatOptionalCurrency(booking.total_amount);
  const statusPresentation = getBookingStatusPresentation(booking);

  return (
    <PageContainer className="max-w-5xl">
      <div className="space-y-4">
        <BookingBreadcrumb current={booking.invoice_number} />

        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
                  {booking.invoice_number}
                </h1>
                <BookingStatusBadge booking={booking} />
              </div>
              <p className="text-base font-medium">{booking.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {RENTAL_MODE_LABELS[booking.mode]}
                <span className="mx-1.5 text-border" aria-hidden="true">
                  ·
                </span>
                <span className="tabular-nums">{formatDate(booking.delivery_date)}</span>
                <span className="mx-1 text-muted-foreground/70" aria-hidden="true">
                  →
                </span>
                <span className="tabular-nums">{formatDate(booking.return_date)}</span>
              </p>
              <p className="max-w-xl text-sm text-muted-foreground">
                {statusPresentation.description}
              </p>
            </div>

            <div className="shrink-0 rounded-xl border bg-muted/30 px-4 py-3 sm:min-w-[10rem] sm:text-right">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total amount
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{totalLabel}</p>
            </div>
          </div>

          <BookingDetailActions bookingId={booking.id} booking={booking} />
        </header>
      </div>

      <Separator className="my-1" />

      <BookingDetailSection
        title="Booking Summary"
        description="Core booking identifiers and audit info."
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BookingDetailField label="Invoice Number" value={booking.invoice_number} />
          <BookingDetailField label="Rental Mode" value={RENTAL_MODE_LABELS[booking.mode]} />
          <BookingDetailField
            label="Status"
            value={
              <span className="inline-flex flex-col gap-1">
                <BookingStatusBadge booking={booking} />
                <span className="text-xs font-normal text-muted-foreground">
                  {statusPresentation.kind === 'lifecycle'
                    ? 'Lifecycle (automatic)'
                    : statusPresentation.kind === 'terminal'
                      ? 'Terminal'
                      : 'Draft'}
                </span>
              </span>
            }
          />
          <BookingDetailField
            label="Lifecycle"
            value={
              statusPresentation.isComputed
                ? statusPresentation.label
                : `${statusPresentation.label} (overrides lifecycle)`
            }
          />
          <BookingDetailField label="Invoice Date" value={formatDate(booking.invoice_date)} />
          <BookingDetailField label="Created Date" value={formatDateTime(booking.created_at)} />
          {createdByLabel ? <BookingDetailField label="Created By" value={createdByLabel} /> : null}
          <BookingDetailField label="Updated Date" value={formatDateTime(booking.updated_at)} />
        </dl>
      </BookingDetailSection>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <BookingDetailSection title="Customer Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <BookingDetailField label="Customer Name" value={booking.customer_name} />
            <BookingDetailField label="Contact Number" value={booking.contact_number} />
            <BookingDetailField label="Address" value={booking.address} className="sm:col-span-2" />
            <BookingDetailField label="City" value={booking.city} />
            <BookingDetailField label="State" value={booking.state} />
            <BookingDetailField label="ZIP Code" value={booking.zip_code} />
            <BookingDetailField
              label="Document Submitted"
              value={booking.document_submitted ? 'Yes' : 'No'}
            />
          </dl>
        </BookingDetailSection>

        <BookingDetailSection title="Vehicle Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <BookingDetailField label="Vehicle Name" value={booking.vehicle.vehicle_name} />
            <BookingDetailField
              label="Vehicle Number"
              value={<span className="tabular-nums">{booking.vehicle.vehicle_number}</span>}
            />
            <BookingDetailField
              label="Fuel Type"
              value={FUEL_TYPE_LABELS[booking.vehicle.fuel_type]}
            />
            <BookingDetailField label="Driver Name" value={booking.driver_name} />
          </dl>
        </BookingDetailSection>

        <BookingDetailSection title="Trip Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <BookingDetailField
              label="Delivery Date"
              value={<span className="tabular-nums">{formatDate(booking.delivery_date)}</span>}
            />
            <BookingDetailField
              label="Return Date"
              value={<span className="tabular-nums">{formatDate(booking.return_date)}</span>}
            />
            <BookingDetailField label="Duration" value={formatDuration(booking.duration)} />
            <BookingDetailField label="Place To Visit" value={booking.place_to_visit} />
            <BookingDetailField label="Fuel Range" value={booking.fuel_range} />
            <BookingDetailField
              label="Start Odometer"
              value={formatOptionalNumber(booking.start_odometer, 'km')}
            />
            <BookingDetailField
              label="End Odometer"
              value={formatOptionalNumber(booking.end_odometer, 'km')}
            />
            <BookingDetailField
              label="Total Kilometers"
              value={formatOptionalNumber(booking.total_kilometers, 'km')}
            />
          </dl>
        </BookingDetailSection>

        <BookingDetailSection title="Payment Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <BookingDetailField
              label="Per Day Charge"
              value={
                <span className="tabular-nums">{formatOptionalCurrency(booking.daily_charge)}</span>
              }
            />
            <BookingDetailField
              label="Kilometer Rate"
              value={
                <span className="tabular-nums">
                  {formatOptionalCurrency(booking.kilometer_rate)}
                </span>
              }
            />
            <BookingDetailField
              label="Booking Amount"
              value={
                <span className="tabular-nums">
                  {formatOptionalCurrency(booking.booking_amount)}
                </span>
              }
            />
            <BookingDetailField
              label="Caution Money"
              value={
                <span className="tabular-nums">
                  {formatOptionalCurrency(booking.caution_money)}
                </span>
              }
            />
            <BookingDetailField label="Payment Method" value={paymentMethodLabel} />
            <BookingDetailField
              label="Total Amount"
              value={
                <span className="font-semibold tabular-nums">
                  {formatOptionalCurrency(booking.total_amount)}
                </span>
              }
            />
          </dl>
        </BookingDetailSection>
      </div>

      <BookingDetailSection title="Notes">
        {notes ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
            <StickyNote className="size-5 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No notes</p>
              <p className="text-sm text-muted-foreground">
                There are no notes attached to this booking.
              </p>
            </div>
          </div>
        )}
      </BookingDetailSection>

      <BookingDetailSection title="Timeline" description="Audit metadata for this booking.">
        <ol className="space-y-0" aria-label="Booking timeline">
          <li className="relative border-l-2 border-border py-1 pl-4">
            <span
              className="absolute top-2.5 -left-[5px] size-2 rounded-full bg-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Created</p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {formatDateTime(booking.created_at)}
            </p>
            {createdByLabel ? (
              <p className="text-sm text-muted-foreground">by {createdByLabel}</p>
            ) : null}
          </li>
          <li className="relative border-l-2 border-border py-1 pl-4">
            <span
              className="absolute top-2.5 -left-[5px] size-2 rounded-full bg-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Last updated</p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {formatDateTime(booking.updated_at)}
            </p>
          </li>
        </ol>
      </BookingDetailSection>
    </PageContainer>
  );
}
