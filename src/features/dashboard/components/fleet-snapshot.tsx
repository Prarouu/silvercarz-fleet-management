'use client';

import { Car } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { VehicleAvailabilityBadge } from '@/features/vehicles/components/vehicle-availability-badge';
import { MotionSection } from '@/features/dashboard/components/motion';
import type { DashboardFleetSnapshotItem } from '@/features/dashboard/types';
import { bookingDetailPath, ROUTES, vehicleDetailPath } from '@/constants/routes';
import { formatDate } from '@/lib/format';

type FleetSnapshotProps = {
  readonly items: readonly DashboardFleetSnapshotItem[];
};

/** Compact fleet roster with availability and booking context. */
export function FleetSnapshot({ items }: FleetSnapshotProps) {
  return (
    <MotionSection delay={0.24} aria-label="Fleet snapshot">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Fleet Snapshot</CardTitle>
            <CardDescription>Availability and next bookings at a glance</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.vehicles}>View fleet</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No vehicles yet"
              description="Add vehicles to see availability, current hires, and upcoming reservations here."
              action={
                <Button asChild size="sm">
                  <Link href={ROUTES.vehiclesNew}>Add vehicle</Link>
                </Button>
              }
            />
          ) : (
            <ScrollArea className="max-h-[28rem] pr-3">
              <ul className="space-y-0" role="list">
                {items.map((item, index) => (
                  <li key={item.vehicleId}>
                    {index > 0 ? <Separator className="my-3" /> : null}
                    <div className="flex flex-col gap-2 rounded-lg p-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={vehicleDetailPath(item.vehicleId)}
                          className="block truncate font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {item.vehicleName}
                        </Link>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {item.registrationNumber}
                        </p>
                        <VehicleAvailabilityBadge availability={item.availability} />
                      </div>
                      <div className="space-y-1 text-sm sm:max-w-[14rem] sm:text-right">
                        <p className="text-muted-foreground">
                          Current:{' '}
                          {item.currentBooking ? (
                            <Link
                              href={bookingDetailPath(item.currentBooking.bookingId)}
                              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                              {item.currentBooking.customerName}
                            </Link>
                          ) : (
                            <span className="text-foreground">—</span>
                          )}
                        </p>
                        <p className="text-muted-foreground">
                          Next:{' '}
                          {item.futureBooking ? (
                            <Link
                              href={bookingDetailPath(item.futureBooking.bookingId)}
                              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                              {item.futureBooking.customerName}
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground tabular-nums sm:text-right">
                                {formatDate(item.futureBooking.deliveryDate)}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-foreground">—</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </MotionSection>
  );
}
