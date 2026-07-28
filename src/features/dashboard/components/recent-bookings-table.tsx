'use client';

import { CalendarRange } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import { MotionSection } from '@/features/dashboard/components/motion';
import { VehicleInline } from '@/features/vehicles/components/vehicle-inline';
import { VehicleThumbnail } from '@/features/vehicles/components/vehicle-thumbnail';
import { bookingDetailPath, ROUTES } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingWithVehicle } from '@/types';

type RecentBookingsTableProps = {
  readonly bookings: readonly BookingWithVehicle[];
};

/** Latest bookings table — row click opens booking details. */
export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const router = useRouter();

  return (
    <MotionSection delay={0.28} aria-label="Recent bookings">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest 10 hires across the fleet</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start">
            <Link href={ROUTES.bookings}>Manage bookings</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="No bookings yet"
              description="Create your first booking to populate recent activity and status charts."
              action={
                <Button asChild size="sm">
                  <Link href={ROUTES.bookingsNew}>New booking</Link>
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                <table className="w-full caption-bottom text-sm">
                  <TableHeader>
                    <TableRow className="bg-table-header hover:bg-table-header">
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer"
                        tabIndex={0}
                        role="link"
                        aria-label={`Open booking ${booking.invoice_number}`}
                        onClick={() => router.push(bookingDetailPath(booking.id))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            router.push(bookingDetailPath(booking.id));
                          }
                        }}
                      >
                        <TableCell className="font-medium tabular-nums">
                          {booking.invoice_number}
                        </TableCell>
                        <TableCell className="max-w-[8rem] truncate md:max-w-[10rem] lg:max-w-[14rem]">
                          {booking.customer_name}
                        </TableCell>
                        <TableCell>
                          <VehicleInline
                            imagePath={booking.vehicle.image_path}
                            name={booking.vehicle.vehicle_name}
                            number={booking.vehicle.vehicle_number}
                            size="xs"
                            className="max-w-[14rem]"
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatDate(booking.delivery_date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatDate(booking.return_date)}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge booking={booking} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(booking.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <ul className="space-y-3 md:hidden" role="list">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-xl border border-border bg-card p-4 text-left transition-colors',
                        'hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                      )}
                      onClick={() => router.push(bookingDetailPath(booking.id))}
                      aria-label={`Open booking ${booking.invoice_number}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <VehicleThumbnail
                            imagePath={booking.vehicle.image_path}
                            alt={`${booking.vehicle.vehicle_name} photo`}
                            size="md"
                          />
                          <div className="min-w-0 space-y-1">
                            <p className="font-medium tabular-nums">{booking.invoice_number}</p>
                            <p className="truncate text-sm">{booking.customer_name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {booking.vehicle.vehicle_name} · {booking.vehicle.vehicle_number}
                            </p>
                          </div>
                        </div>
                        <BookingStatusBadge booking={booking} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">
                          {formatDate(booking.delivery_date)} → {formatDate(booking.return_date)}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </MotionSection>
  );
}
