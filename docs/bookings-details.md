# Booking Details UI

Phase 4.4 adds the Booking Details workspace at `/bookings/[id]`. Managers use
this screen as the central place to review a booking before editing or (in
future phases) printing an invoice or deleting the record.

## Architecture

```
/bookings/[id] (Server Component)
  → getBookingWithVehicle(id) Server Action
  → optional getProfileById(created_by) for Created By label
  → BookingDetailPage
       ├── Breadcrumb + Header (invoice, customer, status)
       ├── BookingDetailActions (Edit / Back / Print* / Delete*)
       ├── Summary card
       ├── Customer + Vehicle cards
       ├── Trip + Payment cards
       ├── Notes card
       └── Timeline / metadata
```

\* Print Invoice and Delete Booking are disabled placeholders only.

Rules:

1. Thin route — the App Router page loads data and renders feature UI.
2. Prefer Server Components; no client components are required for this screen.
3. One backend fetch for booking + vehicle (`getBookingWithVehicle`).
4. UI never imports Supabase or the booking repository.
5. Status badges reuse `BookingStatusBadge`.
6. Invoice printing and delete are **not** implemented here.

## Route

| Path             | File                                   |
| ---------------- | -------------------------------------- |
| `/bookings/[id]` | `src/app/(app)/bookings/[id]/page.tsx` |

| Supporting file | Purpose                                   |
| --------------- | ----------------------------------------- |
| `loading.tsx`   | `BookingDetailSkeleton` (no layout shift) |
| `not-found.tsx` | Friendly empty state + Return to Bookings |

List entry point: row **View** action → `bookingDetailPath(id)`.

Edit entry point from details: **Edit Booking** → `bookingEditPath(id)`.

## Card organization

| Card                 | Contents                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| Booking Summary      | Invoice, mode, status, invoice date, created/updated dates, created by |
| Customer Information | Name, contact, address, city, state, ZIP, document submitted           |
| Vehicle Information  | Name, number, fuel type, driver name                                   |
| Trip Information     | Delivery/return, duration, place, fuel range, odometer, total km       |
| Payment Information  | Daily charge, km rate, booking amount, caution, payment method, total  |
| Notes                | Notes text, or a compact empty state when blank                        |
| Timeline             | Created / last updated audit trail                                     |

Layout:

- Desktop: two-column grid for Customer/Vehicle and Trip/Payment
- Tablet: adaptive grid
- Mobile: single-column stacked cards

## Data loading strategy

1. Server Component calls `getBookingWithVehicle(id)` once.
2. `booking_not_found` → Next.js `notFound()` → segment `not-found.tsx`.
3. Permission / network / server failures → `BookingDetailPage` error alert with
   Back to Bookings.
4. When `created_by` is present, resolve a display label via `getProfileById`
   (full name → email → `"Staff member"`). There is no `updated_by` column yet,
   so Updated By is omitted until the schema supports it.

## Feature files

```
src/features/bookings/components/
├── booking-detail-page.tsx       ← workspace composition
├── booking-detail-actions.tsx    ← action bar
├── booking-detail-section.tsx    ← card shell
├── booking-detail-field.tsx      ← label / value pair
└── booking-detail-skeleton.tsx   ← loading UI
```

Shared helpers:

- `bookingDetailPath(id)` in `@/constants/routes`
- `BookingStatusBadge` for status colors
- `formatDate` / `formatDateTime` / `formatCurrency` / `formatNumber` from `@/lib/format`

## Future extension points

| Extension      | Hook                                                             |
| -------------- | ---------------------------------------------------------------- |
| Print Invoice  | Enable the Print button; add print/PDF module (Phase later)      |
| Delete Booking | Enable Delete; wire existing `deleteBooking` action + confirm UI |
| Updated By     | Add column / join, then surface next to Updated Date             |
| Status changes | Action bar buttons calling future status-transition actions      |
| Activity feed  | Expand Timeline with edit history when an audit log exists       |

## Related docs

- [Edit Booking](./bookings-edit.md)
- [Create Booking](./bookings-create.md)
- [Bookings list](./bookings-list.md)
- [Bookings data layer](./bookings-data-layer.md)
