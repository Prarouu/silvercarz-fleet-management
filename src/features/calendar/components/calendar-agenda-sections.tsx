import Link from 'next/link';
import type { ReactNode } from 'react';
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
import { cn } from '@/lib/utils';

type UpcomingPickupsProps = {
  readonly items: readonly CalendarAgendaItem[];
};

type UpcomingReturnsProps = {
  readonly items: readonly CalendarAgendaItem[];
};

function AgendaMobileCard({
  item,
  meta,
}: {
  readonly item: CalendarAgendaItem;
  readonly meta: ReactNode;
}) {
  return (
    <li>
      <Link
        href={bookingDetailPath(item.bookingId)}
        className={cn(
          'block rounded-xl border bg-card p-4 transition-colors',
          'hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        )}
        aria-label={`Open booking ${item.invoiceNumber}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-primary tabular-nums">{item.invoiceNumber}</p>
            <p className="truncate text-sm">{item.customerName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.vehicleName} · {item.registrationNumber}
            </p>
          </div>
          <Badge variant={item.badgeVariant} aria-label={`Status: ${item.statusLabel}`}>
            {item.statusLabel}
          </Badge>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{meta}</div>
      </Link>
    </li>
  );
}

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
        <>
          <div className="hidden overflow-hidden rounded-xl border md:block">
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
                    <TableCell className="max-w-[10rem] truncate lg:max-w-[14rem]">
                      {item.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[10rem] space-y-0.5 lg:max-w-[14rem]">
                        <p className="truncate">{item.vehicleName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.registrationNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDate(item.date)}
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

          <ul className="space-y-3 md:hidden" role="list">
            {items.map((item) => (
              <AgendaMobileCard
                key={item.bookingId}
                item={item}
                meta={
                  <span className="tabular-nums">
                    Pickup <time dateTime={item.date}>{formatDate(item.date)}</time>
                  </span>
                }
              />
            ))}
          </ul>
        </>
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
        <>
          <div className="hidden overflow-hidden rounded-xl border md:block">
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
                      <div className="max-w-[10rem] space-y-0.5 lg:max-w-[14rem]">
                        <p className="truncate">{item.vehicleName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.registrationNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate lg:max-w-[14rem]">
                      {item.customerName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
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

          <ul className="space-y-3 md:hidden" role="list">
            {items.map((item) => (
              <AgendaMobileCard
                key={item.bookingId}
                item={item}
                meta={
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="tabular-nums">
                      Return <time dateTime={item.date}>{formatDate(item.date)}</time>
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {item.remainingBalance != null ? formatCurrency(item.remainingBalance) : '—'}
                    </span>
                  </div>
                }
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
