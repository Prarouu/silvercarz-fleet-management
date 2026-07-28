# Vehicles list UI (Fleet Management)

Phase 5.1 adds the primary fleet working screen at `/vehicles`. Phase 5.2
implements Add Vehicle at `/vehicles/new` — see [vehicles-create.md](./vehicles-create.md).
Phase 5.3 implements Edit Vehicle at `/vehicles/[id]/edit` — see
[vehicles-edit.md](./vehicles-edit.md). Phase 5.4 implements Vehicle Details
at `/vehicles/[id]` — see [vehicles-details.md](./vehicles-details.md).

## Architecture

```
/vehicles (Server Component)
  → parse URL searchParams
  → listVehicles(query) + countVehicles(...) Server Actions
  → Vehicle Service → Repository
  → VehicleList (composition)
       ├── VehicleSummaryCards   (server — fleet totals)
       ├── VehicleListToolbar    (client — updates URL)
       ├── VehicleListTable      (client — TanStack Table)
       ├── VehicleListPagination (client — updates URL)
       └── Empty / Error states
```

Rules:

1. URL search params are the source of truth for filters, sort, and page.
2. The Server Component fetches; client widgets only navigate / refresh.
3. No repository or Supabase imports in UI components.
4. Reuses the same TanStack Table + sticky header + mobile card pattern as
   the Bookings list (shared table architecture — no second table system).
5. Row **Edit** navigates to `/vehicles/[id]/edit` (Phase 5.3).
   **View** navigates to `/vehicles/[id]` (Phase 5.4). Deactivate and Delete
   remain placeholders.
6. **Add Vehicle** navigates to `/vehicles/new` (implemented in Phase 5.2).

## Route

| Path        | File                              |
| ----------- | --------------------------------- |
| `/vehicles` | `src/app/(app)/vehicles/page.tsx` |

Loading UI: `src/app/(app)/vehicles/loading.tsx` → `VehicleListSkeleton`.

Sidebar already includes Vehicles via `mainNavItems` → `ROUTES.vehicles`.

## Layout

1. Header — title, subtitle, Add Vehicle
2. Fleet summary cards
3. Toolbar — search + filters + refresh / clear
4. Vehicle table (or empty / error state)
5. Pagination

## URL parameters

| Param          | Maps to        | Notes                                                            |
| -------------- | -------------- | ---------------------------------------------------------------- |
| `q`            | `search`       | Debounced server-side search                                     |
| `fuelType`     | `fuelType`     | Fuel type enum                                                   |
| `availability` | `availability` | `available` / `booked` / `reserved` / `maintenance` / `inactive` |
| `status`       | `status`       | `active` / `inactive`                                            |
| `page`         | `page`         | Default `1`                                                      |
| `pageSize`     | `pageSize`     | `10` / `20` / `50` / `100`                                       |
| `sortBy`       | `sortBy`       | Backend sort fields only                                         |
| `sortOrder`    | `sortOrder`    | `asc` / `desc`                                                   |

Helpers live in `src/features/vehicles/lib/vehicle-list-params.ts`.

Fleet list queries always pass `includeInactive: true` so managers see the
full roster unless Status narrows the set.

## Summary cards

| Card               | Source                                              |
| ------------------ | --------------------------------------------------- |
| Total Vehicles     | `countVehicles({ includeInactive: true })`          |
| Available Vehicles | `countVehicles({ available: true })`                |
| Booked Vehicles    | Active vehicles with `availability_status = booked` |
| Inactive Vehicles  | `countVehicles({ isActive: false })`                |

Counts are fetched in parallel with the list and do not re-run the list query.

## Table structure

TanStack Table (manual sorting) + shadcn table primitives — same architecture
as Bookings.

| Column         | Sortable (server) | Source field                                 |
| -------------- | ----------------- | -------------------------------------------- |
| Vehicle Name   | Yes               | `vehicle_name`                               |
| Vehicle Number | Yes               | `vehicle_number`                             |
| Fuel Type      | Yes               | `fuel_type`                                  |
| Daily Charge   | No                | `default_daily_rate`                         |
| Availability   | No                | `availability_status` (hidden when inactive) |
| Status         | No                | `is_active`                                  |
| Created Date   | Yes               | `created_at`                                 |
| Actions        | —                 | —                                            |

Desktop: sticky header inside a vertically scrollable region.  
Mobile (`md` and below): stacked cards with the same fields.

## Search flow

1. User types in the toolbar search input.
2. `useDebounce` (350ms) updates the `q` query param (resets `page` to 1).
3. The Server Component re-renders and calls `listVehicles` with `search`.
4. Repository matches vehicle name and vehicle number (plus fuel/status terms
   when the search string is an exact enum / active keyword).

No client-side row filtering.

## Filtering flow

- **Fuel type** writes `fuelType` to the URL → `VehicleListQuery.fuelType`.
- **Availability = Available** → `available: true` (active vehicles today).
- **Availability = Booked / Maintenance** — future-ready UI options. The page
  short-circuits to an empty result until conflict / workshop backends exist.
- **Status** → `isActive: true | false`.
- **Clear filters** navigates to `/vehicles` with no query string.
- **Refresh** calls `router.refresh()` to re-run the server fetch.

## Pagination

Connected to `PaginatedResult.meta` from the service:

- Previous / Next
- Page number buttons (with ellipsis for large sets)
- Rows per page select
- “Showing X–Y of Z vehicles”

## Status & availability badges

| Kind         | Values                                  | Component                  |
| ------------ | --------------------------------------- | -------------------------- |
| Availability | Available, Booked, Maintenance (future) | `VehicleAvailabilityBadge` |
| Status       | Active, Inactive                        | `VehicleStatusBadge`       |

Today, active vehicles resolve to **Available**. Inactive rows show `—` for
availability. Booked / Maintenance badges are wired for future row data.

## States

| State   | UI                                                |
| ------- | ------------------------------------------------- |
| Loading | Route `loading.tsx` + `VehicleListSkeleton`       |
| Empty   | `EmptyState` (different copy when filters active) |
| Error   | `VehicleListError` → safe message + retry         |

Permission and backend failures surface `ApiResponse.error.message` only —
never raw Supabase / Postgres payloads.

## Feature files

```
src/features/vehicles/
├── components/
│   ├── vehicle-list.tsx
│   ├── vehicle-list-toolbar.tsx
│   ├── vehicle-list-table.tsx
│   ├── vehicle-list-pagination.tsx
│   ├── vehicle-list-skeleton.tsx
│   ├── vehicle-list-error.tsx
│   ├── vehicle-list-refresh-button.tsx
│   ├── vehicle-summary-cards.tsx
│   ├── vehicle-row-actions.tsx
│   ├── vehicle-availability-badge.tsx
│   ├── vehicle-status-badge.tsx
│   └── index.ts
└── lib/
    └── vehicle-list-params.ts

src/app/(app)/vehicles/
├── page.tsx
└── loading.tsx
```

## Related docs

- [Vehicles data layer](./vehicles-data-layer.md)
- [Bookings list UI](./bookings-list.md) — shared table pattern reference
- [Architecture](./architecture.md)
