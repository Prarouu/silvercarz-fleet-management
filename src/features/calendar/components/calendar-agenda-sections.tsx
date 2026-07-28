import Link from 'next/link';
import { CalendarArrowDown, CalendarArrowUp } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingDetailPath } from '@/constants/routes';
import type { CalendarAgendaItem } from '@/features/calendar/types';
import { formatCurrency, formatDate } from '@/lib/format';

type UpcomingPickupsProps = {
  readonly items: readonly CalendarAgendaItem[];
};

type UpcomingReturnsProps = {
  readonly items: readonly CalendarAgendaItem[];
};

export function UpcomingPickups({ items }: UpcomingPickupsProps) {
  return (
    <section className="space-y-3" aria-label="Upcoming pickups">
      <div className="space-y-1">
        <h2 className="text-subheading tracking-tight">Upcoming Pickups</h2>
        <p className="text-body text-muted-foreground">
          Today&apos;s and future deliveries. Click a row to open booking details.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarArrowUp}
          title="No upcoming pickups"
          description="Deliveries scheduled from today onward will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.bookingId} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={bookingDetailPath(item.bookingId)}
                      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {item.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p>{item.vehicleName}</p>
                      <p className="text-xs text-muted-foreground">{item.registrationNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <Badge variant={item.badgeVariant} aria-label={`Status: ${item.statusLabel}`}>
                      {item.statusLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export function UpcomingReturns({ items }: UpcomingReturnsProps) {
  return (
    <section className="space-y-3" aria-label="Upcoming returns">
      <div className="space-y-1">
        <h2 className="text-subheading tracking-tight">Upcoming Returns</h2>
        <p className="text-body text-muted-foreground">
          Vehicles due back from today. Outstanding balance uses the Pricing Engine.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarArrowDown}
          title="No upcoming returns"
          description="Return dates from today onward will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.bookingId} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={bookingDetailPath(item.bookingId)}
                      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {item.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p>{item.vehicleName}</p>
                      <p className="text-xs text-muted-foreground">{item.registrationNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell className="tabular-nums">{formatDate(item.date)}</TableCell>
                  <TableCell className="tabular-nums">
                    {item.remainingBalance != null ? formatCurrency(item.remainingBalance) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.badgeVariant} aria-label={`Status: ${item.statusLabel}`}>
                      {item.statusLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
