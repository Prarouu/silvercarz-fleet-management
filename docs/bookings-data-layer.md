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
├── errors.ts          # Domain AppError factories
├── types.ts           # Re-exports from @/types
└── index.ts           # Public feature barrel
```

## Repository pattern

`createBookingRepository(client)` accepts a `TypedSupabaseClient` so a future
transaction / unit-of-work can inject one client for multiple writes.

| Method                             | Persistence behavior                             |
| ---------------------------------- | ------------------------------------------------ |
| `create`                           | Insert row                                       |
| `update`                           | Patch by id                                      |
| `softDelete`                       | Set `status = cancelled` (preferred)             |
| `delete`                           | Hard delete                                      |
| `findById` / `findByInvoiceNumber` | Single-row reads                                 |
| `findByIdWithVehicle`              | Join `vehicles`                                  |
| `list` / `search`                  | Filters + sort + offset pagination + total count |
| `count`                            | Head count with same filters                     |
| `findOverlappingForVehicle`        | Date-range overlap for availability              |

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
- Invoice uniqueness
- Date integrity
- Duration / km / amount calculations
- Vehicle availability (overlap query; drafts/cancelled skip enforcement)
- Invoice number suggestion helper (sequence placeholder for later)

Public methods return `ApiResponse<T>` via `fromPromise` — never raw Supabase
errors.

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

| Code                          | When                          |
| ----------------------------- | ----------------------------- |
| `booking_not_found`           | Missing id / invoice          |
| `duplicate_invoice`           | Unique invoice conflict       |
| `vehicle_unavailable`         | Overlapping active hire       |
| `invalid_booking_dates`       | Return before delivery        |
| `unauthorized_booking_access` | Reserved for finer ACL        |
| `database_failure`            | Unexpected persistence errors |
| `validation`                  | Zod / input failures          |

UI should read `ApiResponse.error.message` only — never PostgREST payloads.

## Calculations

Pure helpers in `service/booking-calculations.ts`:

- Inclusive duration days (same-day = 1)
- Total kilometers from odometer
- Booking amount = daily × duration + km rate × km
- Total amount (MVP) = booking amount (caution kept separate)
- `buildInvoiceNumberSuggestion` for future sequential invoices

## Future extension points

1. **DB transactions** — pass one `TypedSupabaseClient` into repository + related writers.
2. **Invoice sequences** — replace caller-supplied numbers with `suggestInvoiceNumber` + a counter table.
3. **Cursor pagination** — honor `BookingListQuery.cursor` beside offset/`range`.
4. **Stricter availability** — Postgres exclusion constraints; service already calls overlap lookup.
5. **Role divergence** — remove `'all'` from managers for `bookings:delete` when needed.
6. **UI** — list screen at `/bookings` (see [bookings-list.md](./bookings-list.md));
   pages call Server Actions only; no repository imports in components.

## List query note

`list` / `search` return `BookingWithVehicle` (embedded `vehicle:vehicles(*)`)
so the bookings table can render vehicle name and registration without N+1
lookups.

## Related docs

- [Bookings list UI](./bookings-list.md)
- [Database schema](./database.md)
- [Types & validation](./types-and-validation.md)
- [Authentication](./authentication.md)
