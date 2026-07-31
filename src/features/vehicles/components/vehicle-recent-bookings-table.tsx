import Link from 'next/link';

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import { bookingDetailPath } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/format';
import type { BookingWithVehicle } from '@/types';

type VehicleRecentBookingsTableProps = {
  readonly bookings: readonly BookingWithVehicle[];
};

/**
 * Compact read-only bookings table for a single vehicle.
 * Reuses BookingStatusBadge — does not duplicate the full Bookings list table.
 */
export function VehicleRecentBookingsTable({ bookings }: VehicleRecentBookingsTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-3">Invoice Number</TableHead>
              <TableHead className="px-3">Customer</TableHead>
              <TableHead className="px-3">Rental Dates</TableHead>
              <TableHead className="px-3">Status</TableHead>
              <TableHead className="px-3 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/40">
                <TableCell className="px-3 py-2.5">
                  <Link
                    href={bookingDetailPath(booking.id)}
                    className="font-medium text-foreground tabular-nums underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {booking.invoice_number}
                  </Link>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <p className="max-w-[12rem] truncate font-medium">{booking.customer_name}</p>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <span className="tabular-nums">
                    {formatDate(booking.delivery_date)}
                    <span className="mx-1 text-muted-foreground/70" aria-hidden="true">
                      →
                    </span>
                    {formatDate(booking.return_date)}
                  </span>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <BookingStatusBadge booking={booking} />
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right">
                  <span className="font-medium tabular-nums">
                    {formatCurrency(booking.total_amount) || '—'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="Recent bookings">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <article className="rounded-3xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={bookingDetailPath(booking.id)}
                    className="block truncate font-semibold tabular-nums underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {booking.invoice_number}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">{booking.customer_name}</p>
                </div>
                <BookingStatusBadge booking={booking} />
              </div>
              <dl className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t pt-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Rental dates</dt>
                  <dd className="tabular-nums">
                    {formatDate(booking.delivery_date)}
                    <span className="mx-1 text-muted-foreground/70" aria-hidden="true">
                      →
                    </span>
                    {formatDate(booking.return_date)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Amount</dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(booking.total_amount) || '—'}
                  </dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
