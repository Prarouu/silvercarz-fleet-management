# Vehicle Details UI (Fleet Profile)

Phase 5.4 adds the Vehicle Details workspace at `/vehicles/[id]`. Managers use
this screen as the single source of truth for one fleet unit — identity,
availability, rental rates, odometer, and recent booking activity.

## Architecture

```
/vehicles/[id] (Server Component)
  → getVehicle(id) Server Action
  → listBookings({ vehicleId }) + countBookings({ vehicleId })
  → VehicleDetailPage
       ├── Breadcrumb + Header (name, registration, badges)
       ├── VehicleDetailActions (Edit / Back / Deactivate* / Delete*)
       ├── Vehicle Overview card (image + identity)
       ├── Quick Statistics cards
       ├── Vehicle Information
       ├── Rental Information
       ├── Operational Information
       ├── Recent Bookings (table or empty state)
       └── Quick Actions
```

\* Deactivate and Delete are disabled placeholders only.

Rules:

1. Thin route — the App Router page loads data and renders feature UI.
2. Prefer Server Components; only the image preview hydrates as a client island.
3. Vehicle data comes from `getVehicle` once. Booking history is a separate,
   isolated fetch so vehicle load never depends on bookings availability.
4. UI never imports Supabase or the vehicle repository.
5. Status / availability badges reuse `VehicleStatusBadge` and
   `VehicleAvailabilityBadge`.
6. Recent bookings reuse `BookingStatusBadge` — they do **not** duplicate the
   full Bookings list table.
7. Maintenance, insurance, and service history are **not** implemented here.
   Section composition leaves room for those modules later.

## Route

| Path             | File                                   |
| ---------------- | -------------------------------------- |
| `/vehicles/[id]` | `src/app/(app)/vehicles/[id]/page.tsx` |

| Supporting file | Purpose                                   |
| --------------- | ----------------------------------------- |
| `loading.tsx`   | `VehicleDetailSkeleton` (no layout shift) |
| `not-found.tsx` | Friendly empty state + Return to Fleet    |

List entry points:

- Row **View** action → `vehicleDetailPath(id)`
- Vehicle name link in the fleet table → `vehicleDetailPath(id)`

Edit entry point from details: **Edit Vehicle** → `vehicleEditPath(id)`.

Breadcrumb: **Fleet Management → Vehicle**.

## Card organization

| Section                 | Contents                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Vehicle Overview        | Image (or placeholder), name, registration, brand/model/variant/year/color, badges |
| Quick Statistics        | Odometer, daily rate, fuel type, total bookings                                    |
| Vehicle Information     | Identity fields + created / last updated                                           |
| Rental Information      | Fuel type, daily rate, extra km rate, security deposit                             |
| Operational Information | Availability, vehicle status, current odometer                                     |
| Recent Bookings         | Compact table or empty state + Create Booking CTA                                  |
| Quick Actions           | Edit, Create Booking, Back to Fleet, Deactivate*, Delete*                          |

Layout:

- Desktop: multi-column cards and stats
- Tablet: adaptive grid
- Mobile: single-column stacked cards (no horizontal scrolling)

## Data loading strategy

1. Server Component calls `getVehicle(id)` once.
2. `vehicle_not_found` → Next.js `notFound()` → segment `not-found.tsx`.
3. Permission / network / database failures → `VehicleDetailPage` error alert
   with Back to Fleet.
4. Recent bookings load via `listBookings({ vehicleId, pageSize: 5, … })`.
5. Total bookings load via `countBookings({ vehicleId })`.
6. If booking queries fail, the vehicle profile still renders. The bookings
   section shows a soft error; the Total Bookings stat shows `—` when the
   count is unavailable (`null` placeholder isolation).

## Feature files

```
src/features/vehicles/components/
├── vehicle-detail-page.tsx           ← workspace composition
├── vehicle-detail-actions.tsx        ← header action bar
├── vehicle-detail-quick-actions.tsx  ← bottom action strip
├── vehicle-detail-section.tsx        ← card shell
├── vehicle-detail-field.tsx          ← label / value pair
├── vehicle-detail-overview.tsx       ← overview card
├── vehicle-detail-image.tsx          ← image / placeholder (client)
├── vehicle-detail-stats.tsx          ← quick statistic cards
├── vehicle-recent-bookings.tsx       ← bookings section + empty state
├── vehicle-recent-bookings-table.tsx ← compact reusable table
└── vehicle-detail-skeleton.tsx       ← loading UI
```

Shared helpers:

- `vehicleDetailPath(id)` / `vehicleEditPath(id)` in `@/constants/routes`
- `VehicleStatusBadge` / `VehicleAvailabilityBadge` for status colors
- `BookingStatusBadge` for booking status in the recent table
- `formatDate` / `formatDateTime` / `formatCurrency` / `formatNumber` from `@/lib/format`
- `getVehicleImagePublicUrl` for Storage previews

## Future extension points

| Extension          | Hook                                                                |
| ------------------ | ------------------------------------------------------------------- |
| Deactivate Vehicle | Enable header / quick action; wire soft-delete confirm UI           |
| Delete Vehicle     | Enable Delete; wire `deleteVehicle` action + confirm UI             |
| Maintenance        | Add a new section card under Operational Information                |
| Insurance          | Add a new section card; keep overview / stats structure unchanged   |
| Service History    | Add a timeline section below Recent Bookings                        |
| Prefill booking    | Pass `vehicleId` into Create Booking when that flow supports it     |
| Activity feed      | Expand Recent Bookings or add an audit timeline when history exists |

## Related docs

- [Vehicles list](./vehicles-list.md)
- [Create Vehicle](./vehicles-create.md)
- [Edit Vehicle](./vehicles-edit.md)
- [Vehicles data layer](./vehicles-data-layer.md)
- [Booking Details](./bookings-details.md)
