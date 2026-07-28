# Bookings data layer

Phase 3.3 implements the booking backend stack. There is **no booking UI** in
this phase — only repository, service, Server Actions, and domain errors.

## Data flow

```
UI (future)
  → Server Actions   (@/features/bookings/actions)
    → Booking Service  (@/features/bookings/service)
      → Booking Repository (@/features/bookings/repository)
        → Supabase client (@/lib/supabase/server)
          → PostgreSQL (RLS + constraints)
```

Rules:

1. UI never imports Supabase clients or the repository.
2. Server Actions never contain SQL / business rules — they delegate to the service.
3. The service owns validation, authorization, calculations, and uniqueness checks.
4. The repository owns persistence only.

## Folder layout

```
src/features/bookings/
├── actions/           # Next.js Server Actions (thin)
├── repository/        # Supabase queries
├── service/           # Business logic + ApiResponse orchestration
│   ├── booking-service.ts
│   ├── pricing.service.ts    # Pricing Engine (money math)
│   ├── conflict.service.ts   # Conflict Detection Engine
│   ├── status.service.ts     # Status Automation Engine
│   ├── invoice-number.service.ts
│   └── booking-calculations.ts  # Invoice helpers + legacy re-exports
├── components/        # List / form / details UI
├── lib/               # Form helpers, list params
├── errors.ts
├── types.ts
└── index.ts
```

## Repository pattern

`createBookingRepository(client)` accepts a `TypedSupabaseClient` so a future
transaction / unit-of-work can inject one client for multiple writes.

| Method                             | Persistence behavior                                   |
| ---------------------------------- | ------------------------------------------------------ |
| `create`                           | Insert row                                             |
| `update`                           | Patch by id                                            |
| `softDelete`                       | Set `status = cancelled` (preferred)                   |
| `delete`                           | Hard delete                                            |
| `findById` / `findByInvoiceNumber` | Single-row reads                                       |
| `findByIdWithVehicle`              | Join `vehicles`                                        |
| `list` / `search`                  | Filters + sort + offset pagination + total count       |
| `count`                            | Head count with same filters                           |
| `findOverlappingForVehicle`        | Confirmed/ongoing date-range overlap (Conflict Engine) |

Search fields: invoice number, customer name, contact number, place to visit,
and vehicle registration (via `vehicles.vehicle_number` → `vehicle_id IN …`).

Cancelled bookings are excluded by default (`includeCancelled: true` to opt in).
`cursor` on `BookingListQuery` is reserved for future keyset pagination.

## Service pattern

`createBookingService({ repository?, client?, requirePermission? })` supports
tests and alternate clients. Default `getBookingService()` uses the request
server client and live auth.

Responsibilities:

- Zod validation (`createBookingSchema`, `updateBookingSchema`, list/search schemas)
- Permission checks (`bookings:read` / `bookings:write` / `bookings:delete`)
- Automatic invoice allocation via `InvoiceNumberService` (create only)
- Invoice uniqueness (belt-and-suspenders with DB unique constraint)
- Date integrity
- Duration / km / amount calculations
- Vehicle availability via Availability Engine + **Conflict Detection Engine**
  (drafts/cancelled skip enforcement; syncs vehicle status after writes)
- **Status Automation Engine** assigns persisted lifecycle status on create /
  update; cancel soft-deletes to `cancelled`
- Invoice allocation runs **after** conflict checks so failed creates do not
  consume sequence numbers

Public methods return `ApiResponse<T>` via `fromPromise` — never raw Supabase
errors. `previewNextInvoiceNumber` returns a plain string for the create form.

See [vehicle-availability.md](./vehicle-availability.md) and
[booking-conflict-detection.md](./booking-conflict-detection.md).

## Server Actions

| Action                      | Service method              |
| --------------------------- | --------------------------- |
| `createBooking`             | `createBooking`             |
| `updateBooking`             | `updateBooking`             |
| `deleteBooking`             | `deleteBooking` (soft)      |
| `getBooking`                | `getBooking`                |
| `getBookingByInvoiceNumber` | `getBookingByInvoiceNumber` |
| `getBookingWithVehicle`     | `getBookingWithVehicle`     |
| `listBookings`              | `listBookings`              |
| `searchBookings`            | `searchBookings`            |
| `countBookings`             | `countBookings`             |

Import from `@/features/bookings` or `@/features/bookings/actions`.

## Authorization

Permissions added in `@/lib/auth/permissions`:

- `bookings:read`
- `bookings:write`
- `bookings:delete`

Owner and Manager currently grant `'all'`, so both roles pass. Narrow the matrix
later without changing service call sites (`requirePermission(...)`).

## Error handling

Domain codes in `BOOKING_ERROR_CODES`:

| Code                          | When                                   |
| ----------------------------- | -------------------------------------- |
| `booking_not_found`           | Missing id / invoice                   |
| `duplicate_invoice`           | Unique invoice conflict                |
| `invoice_generation_failed`   | Sequence RPC / format failure          |
| `vehicle_unavailable`         | Operational block or schedule conflict |
| `booking_conflict`            | Reserved alias for schedule conflicts  |
| `invalid_booking_dates`       | Return before delivery                 |
| `unauthorized_booking_access` | Reserved for finer ACL                 |
| `database_failure`            | Unexpected persistence errors          |
| `validation`                  | Zod / input failures                   |

UI should read `ApiResponse.error.message` only — never PostgREST payloads.

## Calculations

All hire money math lives in the **Pricing Engine**
(`service/pricing.service.ts`). See [booking-pricing-engine.md](./booking-pricing-engine.md).

- Inclusive duration days (same-day = 1)
- Total kilometers from odometer
- Rental charge + kilometer charge → subtotal / grand total
- Remaining balance = grand total − amount paid (`booking_amount`)
- Caution / security deposit kept separate
- `buildInvoiceNumberSuggestion` — pure formatter in `booking-calculations.ts`
  (prefer `InvoiceNumberService`)

Invoice allocation is documented in [invoice-numbering.md](./invoice-numbering.md).

## Future extension points

1. **DB transactions** — pass one `TypedSupabaseClient` into repository + related writers.
2. **Cursor pagination** — honor `BookingListQuery.cursor` beside offset/`range`.
3. **Exclusion constraints** — Postgres `daterange` exclusion; Conflict Engine already owns app rules.
4. **Role divergence** — remove `'all'` from managers for `bookings:delete` when needed.
5. **Company settings** — override invoice prefix via service deps / settings table.

## List query note

`list` / `search` return `BookingWithVehicle` (embedded `vehicle:vehicles(*)`)
so the bookings table can render vehicle name and registration without N+1
lookups.

## Related docs

- [Bookings list UI](./bookings-list.md)
- [Database schema](./database.md)
- [Types & validation](./types-and-validation.md)
- [Authentication](./authentication.md)
