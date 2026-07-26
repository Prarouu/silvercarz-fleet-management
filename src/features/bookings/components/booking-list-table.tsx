'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookingRowActions } from '@/features/bookings/components/booking-row-actions';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import {
  buildBookingListSearchParams,
  type BookingListUrlState,
} from '@/features/bookings/lib/booking-list-params';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingSortField, BookingWithVehicle } from '@/types';
import { RENTAL_MODE_LABELS } from '@/types';

const SORTABLE_COLUMNS: Record<string, BookingSortField> = {
  invoice_number: 'invoice_number',
  customer_name: 'customer_name',
  delivery_date: 'delivery_date',
  return_date: 'return_date',
  created_at: 'created_at',
};

type BookingListTableProps = {
  readonly data: readonly BookingWithVehicle[];
  readonly state: BookingListUrlState;
};

function SortIcon({
  columnId,
  sortBy,
  sortOrder,
}: {
  columnId: string;
  sortBy: BookingSortField;
  sortOrder: 'asc' | 'desc';
}) {
  const field = SORTABLE_COLUMNS[columnId];
  if (!field) {
    return null;
  }

  if (sortBy !== field) {
    return <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />;
  }

  return sortOrder === 'asc' ? (
    <ArrowUp className="size-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden="true" />
  );
}

export function BookingListTable({ data, state }: BookingListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const sorting = useMemo<SortingState>(
    () => [{ id: state.sortBy, desc: state.sortOrder === 'desc' }],
    [state.sortBy, state.sortOrder],
  );

  const columns = useMemo<ColumnDef<BookingWithVehicle>[]>(
    () => [
      {
        id: 'invoice_number',
        accessorKey: 'invoice_number',
        header: 'Invoice',
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{row.original.invoice_number}</span>
        ),
      },
      {
        id: 'customer_name',
        accessorKey: 'customer_name',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.customer_name}</p>
            {row.original.contact_number ? (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.contact_number}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'vehicle',
        accessorFn: (row) => row.vehicle.vehicle_number,
        header: 'Vehicle',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.vehicle.vehicle_name}</p>
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {row.original.vehicle.vehicle_number}
            </p>
          </div>
        ),
      },
      {
        id: 'mode',
        accessorKey: 'mode',
        header: 'Mode',
        enableSorting: false,
        cell: ({ row }) => RENTAL_MODE_LABELS[row.original.mode],
      },
      {
        id: 'delivery_date',
        accessorKey: 'delivery_date',
        header: 'Delivery',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDate(row.original.delivery_date)}</span>
        ),
      },
      {
        id: 'return_date',
        accessorKey: 'return_date',
        header: 'Return',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDate(row.original.return_date)}</span>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
      },
      {
        id: 'total_amount',
        accessorKey: 'total_amount',
        header: 'Total',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.total_amount)}
          </span>
        ),
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <BookingRowActions
            bookingId={row.original.id}
            invoiceNumber={row.original.invoice_number}
          />
        ),
      },
    ],
    [],
  );

  // TanStack Table returns unstable function identities — React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library -- required table API
  const table = useReactTable({
    data: data as BookingWithVehicle[],
    columns,
    state: { sorting },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  function onSort(columnId: string) {
    const field = SORTABLE_COLUMNS[columnId];
    if (!field) {
      return;
    }

    const nextOrder =
      state.sortBy === field ? (state.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc';

    const query = buildBookingListSearchParams(state, {
      sortBy: field,
      sortOrder: nextOrder,
      page: 1,
    });

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div
        className={cn(
          'hidden overflow-hidden rounded-lg border md:block',
          isPending && 'opacity-80',
        )}
        aria-busy={isPending}
      >
        <div className="max-h-[min(70vh,44rem)] overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const sortable = Boolean(SORTABLE_COLUMNS[header.column.id]);
                    const label = flexRender(header.column.columnDef.header, header.getContext());

                    return (
                      <TableHead key={header.id} scope="col">
                        {header.isPlaceholder ? null : sortable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 gap-1 px-2 font-medium"
                            onClick={() => onSort(header.column.id)}
                            aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                          >
                            {label}
                            <SortIcon
                              columnId={header.column.id}
                              sortBy={state.sortBy}
                              sortOrder={state.sortOrder}
                            />
                          </Button>
                        ) : (
                          label
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <ul
        className={cn('space-y-3 md:hidden', isPending && 'opacity-80')}
        aria-busy={isPending}
        aria-label="Bookings"
      >
        {data.map((booking) => (
          <li key={booking.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold tabular-nums">{booking.invoice_number}</p>
                <p className="truncate text-sm">{booking.customer_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.vehicle.vehicle_name} · {booking.vehicle.vehicle_number}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <BookingStatusBadge status={booking.status} />
                <BookingRowActions bookingId={booking.id} invoiceNumber={booking.invoice_number} />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Mode</dt>
                <dd>{RENTAL_MODE_LABELS[booking.mode]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">{formatCurrency(booking.total_amount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Delivery</dt>
                <dd className="tabular-nums">{formatDate(booking.delivery_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Return</dt>
                <dd className="tabular-nums">{formatDate(booking.return_date)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
