'use client';

import { CalendarClock } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BOOKING_DISPLAY_STATUS_BADGE_VARIANTS,
  BOOKING_DISPLAY_STATUS_LABELS,
} from '@/features/bookings/service/status.service';
import { MotionSection } from '@/features/dashboard/components/motion';
import type { DashboardScheduleItem } from '@/features/dashboard/types';
import { bookingDetailPath, ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';

type TodaysScheduleProps = {
  readonly items: readonly DashboardScheduleItem[];
};

/** Chronological list of bookings involving today. */
export function TodaysSchedule({ items }: TodaysScheduleProps) {
  return (
    <MotionSection delay={0.2} aria-label="Today's schedule">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Pickups, returns, and active hires for today</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start">
            <Link href={ROUTES.calendar}>Open calendar</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled today"
              description="When deliveries or returns fall on today, they will appear here in chronological order."
              action={
                <Button asChild size="sm">
                  <Link href={ROUTES.bookingsNew}>Create booking</Link>
                </Button>
              }
            />
          ) : (
            <ScrollArea className="max-h-[28rem] pr-3">
              <ul className="space-y-0" role="list">
                {items.map((item, index) => (
                  <li key={item.bookingId}>
                    {index > 0 ? <Separator className="my-3" /> : null}
                    <Link
                      href={bookingDetailPath(item.bookingId)}
                      className="group flex flex-col gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate font-medium group-hover:underline">
                          {item.vehicleName}{' '}
                          <span className="font-normal text-muted-foreground">
                            ({item.vehicleNumber})
                          </span>
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.customerName}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div className="text-xs text-muted-foreground tabular-nums sm:text-right">
                          <p>
                            Pickup{' '}
                            <time dateTime={item.deliveryDate}>
                              {formatDate(item.deliveryDate)}
                            </time>
                          </p>
                          <p>
                            Return{' '}
                            <time dateTime={item.returnDate}>{formatDate(item.returnDate)}</time>
                          </p>
                        </div>
                        <Badge
                          variant={BOOKING_DISPLAY_STATUS_BADGE_VARIANTS[item.displayStatus]}
                          className="font-medium tracking-wide"
                          aria-label={`Status: ${BOOKING_DISPLAY_STATUS_LABELS[item.displayStatus]}`}
                        >
                          {BOOKING_DISPLAY_STATUS_LABELS[item.displayStatus]}
                        </Badge>
                      </div>
                    </Link>
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
