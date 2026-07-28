# Booking Conflict Detection Engine

Phase 6.3 introduces a **centralized Conflict Detection Engine** that prevents
overlapping hires of the same vehicle. Every booking surface (admin create/edit,
future customer portal, API, calendar, reports) must call this service — never
reimplement overlap rules in React components or ad-hoc queries.

## Architecture

```
UI / Server Actions / API / Calendar / Reports
  → Booking Service
      → Availability Engine   (operational: maintenance / inactive)
      → Conflict Service      (schedule: date-window overlap)
          → Booking Repository.findOverlappingForVehicle
            → PostgreSQL (partial index on blocking statuses)
```

Rules:

1. Conflict logic lives only in `ConflictService` (`service/conflict.service.ts`).
2. UI never calculates overlaps; it only displays friendly `ApiResponse` errors.
3. Edit flows always pass `excludeBookingId` so a booking does not conflict with itself.
4. Operational bookability stays in the Availability Engine; schedule conflicts stay here.

## Overlap algorithm

Inclusive (closed) date windows. A conflict exists when:

```
existing.delivery_date <= new.return_date
AND existing.return_date >= new.delivery_date
```

This correctly detects:

| Case            | Example                                     |
| --------------- | ------------------------------------------- |
| Full overlap    | Existing 1–10, new 1–10                     |
| Partial overlap | Existing 1–10, new 8–15                     |
| Inside overlap  | Existing 1–10, new 3–5                      |
| Outside overlap | Existing 3–5, new 1–10                      |
| Same start date | Existing 1–5, new 1–8                       |
| Same end date   | Existing 1–5, new 3–5                       |
| Same period     | Identical windows, including same-day hires |

Adjacent windows (return 31 Jul, next delivery 1 Aug) do **not** conflict.
Same-day handoff (return 31 Jul, next delivery 31 Jul) **does** conflict —
the vehicle is held through the return date inclusive.

> Note: Continuous-time literature sometimes writes `start < otherEnd AND end > otherStart`
> for half-open intervals. Rental dates here are closed intervals, so inclusive
> comparisons are required (especially for same-day bookings).

## Business rules — which statuses block?

Centralized in `CONFLICT_BLOCKING_STATUSES` / `CONFLICT_IGNORED_STATUSES`:

| Status      | Blocks availability? | Rationale                                  |
| ----------- | -------------------- | ------------------------------------------ |
| `confirmed` | Yes                  | Future / active hire occupies the calendar |
| `ongoing`   | Yes                  | Vehicle currently on hire                  |
| `completed` | No                   | Hire finished; vehicle is free             |
| `cancelled` | No                   | Soft-deleted; ignored                      |
| `draft`     | No                   | Not yet committed                          |

Future `rejected` (if added) should join the ignored set.

Target booking status also matters: creating/updating as `draft` or `cancelled`
skips conflict enforcement (same as Availability sync rules).

## Create / edit flow

```
Validate input (Zod)
  → Assert operational bookability (Availability Engine)
  → Run Conflict Detection Service
  → If conflict: friendly validation error (no invoice consumed)
  → Else: generate invoice number → persist → sync availability
```

Edit always passes `excludeBookingId: <current id>` and re-checks after vehicle
or date changes.

## Service API

`createConflictService` / `getConflictService`:

| Method                 | Responsibility                                        |
| ---------------------- | ----------------------------------------------------- |
| `detectConflicts`      | Query overlaps; return conflict details + message     |
| `assertNoConflict`     | Throw friendly domain error when any conflict exists  |
| `datesOverlap`         | Pure closed-interval helper (no I/O)                  |
| `getNextAvailableDate` | Optional: booked-until + suggested next delivery date |

`getNextAvailableDate` is isolated for calendars / UX suggestions — create/update
do not depend on it.

## Error messages

Conflicts surface as `vehicle_unavailable` (form already highlights the vehicle
field) with messages like:

```
This vehicle is already booked between 28 Jul 2026 and 31 Jul 2026.
(Invoice SC-2026-00012 · Priya Sharma · Confirmed)
```

Never expose PostgREST / Postgres payloads.

## Form UX

On conflict:

- Root alert (`aria-live="assertive"`) shows the friendly message
- Vehicle field is highlighted with the conflict message
- Delivery / return fields show a short inline hint
- Entered form values are preserved; submission is blocked

## Performance

- Overlap check is a single indexed SQL query via `findOverlappingForVehicle`
- Filters: `vehicle_id`, blocking `status IN (confirmed, ongoing)`, date window
- Partial index `bookings_vehicle_conflict_dates_idx` matches those statuses
- Existing single-column indexes on `vehicle_id`, `delivery_date`, `return_date`,
  `status` remain for list/filter paths
- No full-table load into memory

## Migration

| File                                                  | Purpose                                    |
| ----------------------------------------------------- | ------------------------------------------ |
| `20260728170000_booking_conflict_detection_index.sql` | Partial index for conflict overlap queries |

Apply with `pnpm dlx supabase db push`.

## Future scheduling integration

- Calendar / resource views can call `detectConflicts` / `getNextAvailableDate`
- Postgres exclusion constraints (`tstzrange` / `daterange`) can harden the DB
  layer later without changing service call sites
- Customer portal and public API must inject the same `ConflictService`
- Availability Engine `checkAvailability` already delegates to ConflictService
  when a date window is provided

## Related docs

- [Bookings data layer](./bookings-data-layer.md)
- [Vehicle Availability Engine](./vehicle-availability.md)
- [Create Booking UI](./bookings-create.md)
- [Edit Booking UI](./bookings-edit.md)
- [Database schema](./database.md)
