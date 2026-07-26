# Bookings list UI

Phase 4.1 adds the primary working screen at `/bookings`. Create, edit, and
detail flows are **not** included — only the list table, toolbar, and
pagination.

## Architecture

```
/bookings (Server Component)
  → parse URL searchParams
  → listBookings(query) Server Action
  → Booking Service → Repository (joins vehicles)
  → BookingList (composition)
       ├── BookingListToolbar   (client — updates URL)
       ├── BookingListTable     (client — TanStack Table)
       ├── BookingListPagination (client — updates URL)
       └── Empty / Error states
```

Rules:

1. URL search params are the source of truth for filters, sort, and page.
2. The Server Component fetches; client widgets only navigate / refresh.
3. No repository or Supabase imports in UI components.
4. Row actions (View / Edit / Delete) are disabled placeholders.

## Route

| Path        | File                              |
| ----------- | --------------------------------- |
| `/bookings` | `src/app/(app)/bookings/page.tsx` |

Loading UI: `src/app/(app)/bookings/loading.tsx` → `BookingListSkeleton`.

## URL parameters

| Param       | Maps to     | Notes                        |
| ----------- | ----------- | ---------------------------- |
| `q`         | `search`    | Debounced server-side search |
| `status`    | `status`    | Booking status enum          |
| `mode`      | `mode`      | Rental mode enum             |
| `page`      | `page`      | Default `1`                  |
| `pageSize`  | `pageSize`  | `10` / `20` / `50` / `100`   |
| `sortBy`    | `sortBy`    | Backend sort fields only     |
| `sortOrder` | `sortOrder` | `asc` / `desc`               |

Helpers live in `src/features/bookings/lib/booking-list-params.ts`.

## Table structure

TanStack Table (manual sorting) + shadcn table primitives.

| Column         | Sortable (server) |
| -------------- | ----------------- |
| Invoice Number | Yes               |
| Customer Name  | Yes               |
| Vehicle        | No (joined)       |
| Rental Mode    | No                |
| Delivery Date  | Yes               |
| Return Date    | Yes               |
| Status         | No                |
| Total Amount   | No                |
| Created At     | Yes               |
| Actions        | —                 |

Desktop: sticky header inside a vertically scrollable region.  
Mobile (`md` and below): stacked cards with the same fields.

List rows are `BookingWithVehicle` — the repository selects
`*, vehicle:vehicles(*)` so the Vehicle column can show name + number.

## Search flow

1. User types in the toolbar search input.
2. `useDebounce` (350ms) updates the `q` query param (resets `page` to 1).
3. The Server Component re-renders and calls `listBookings` with `search`.
4. Repository matches invoice, customer, contact, place, and vehicle number.

No client-side row filtering.

## Filtering flow

- **Status** / **Rental mode** selects write `status` / `mode` to the URL.
- **Date range** control is a disabled placeholder (backend date filters exist;
  UI wiring is deferred).
- **Clear filters** navigates to `/bookings` with no query string.
- **Refresh** calls `router.refresh()` to re-run the server fetch.

Default list excludes cancelled bookings unless Status = Cancelled.

## Pagination

Connected to `PaginatedResult.meta` from the service:

- Previous / Next
- Page number buttons (with ellipsis for large sets)
- Rows per page select
- “Showing X–Y of Z bookings”

## States

| State   | UI                                                |
| ------- | ------------------------------------------------- |
| Loading | Route `loading.tsx` + `BookingListSkeleton`       |
| Empty   | `EmptyState` (different copy when filters active) |
| Error   | `BookingListError` → safe message + retry         |

## Feature files

```
src/features/bookings/
├── components/
│   ├── booking-list.tsx
│   ├── booking-list-toolbar.tsx
│   ├── booking-list-table.tsx
│   ├── booking-list-pagination.tsx
│   ├── booking-list-skeleton.tsx
│   ├── booking-list-error.tsx
│   ├── booking-list-refresh-button.tsx
│   ├── booking-row-actions.tsx
│   ├── booking-status-badge.tsx
│   └── index.ts
└── lib/
    └── booking-list-params.ts
```

## Related docs

- [Bookings data layer](./bookings-data-layer.md)
- [Architecture](./architecture.md)
