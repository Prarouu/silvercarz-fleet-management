# Booking Status Automation Engine

Phase 6.4 introduces a **centralized Booking Status Automation Engine** that
owns lifecycle determination, badge presentation, and the persisted status
values used by Conflict Detection and Availability sync.

UI never calculates booking status. Every surface (list, details, forms,
conflict messages, availability transitions, future dashboard metrics) obtains
status from this engine.

## Architecture

```
UI / Server Actions / Availability / Conflict / Dashboard
  → Status Service  (@/features/bookings/service/status.service)
      → Pure date + terminal rules
  → Booking Service (writes persisted status on create / update / cancel)
      → Booking Repository
        → PostgreSQL (`bookings.status` enum — terminal + synced lifecycle)
```

Rules:

1. Lifecycle statuses are **computed** from delivery / return dates.
2. Terminal statuses are **stored** and always override lifecycle.
3. UI never hardcodes status colors — badges use shared `Badge` variants from
   the Status Service presentation model.
4. Availability and Conflict engines classify hires via Status Service helpers
   (`isScheduleBlockingBooking` / display status), not ad-hoc date copies.

## Display statuses

| Status      | Kind      | Meaning                                      |
| ----------- | --------- | -------------------------------------------- |
| `upcoming`  | Lifecycle | Current date &lt; delivery date              |
| `active`    | Lifecycle | Delivery ≤ today ≤ return (inclusive window) |
| `completed` | Lifecycle | Current date &gt; return date                |
| `cancelled` | Terminal  | Soft-deleted — always wins                   |
| `draft`     | Special   | Pre-commit; not date-derived                 |
| `no_show`   | Terminal  | Future-ready (not in DB enum yet)            |
| `closed`    | Terminal  | Future-ready (not in DB enum yet)            |

### Precedence

1. Stored **cancelled** (and future `no_show` / `closed`) → terminal display
2. Stored **draft** → draft
3. Else compute lifecycle from dates

Cancelled always overrides lifecycle calculation.

### Inclusive return day

`ACTIVE` covers the closed rental window through the return date inclusive so
same-day hires and Availability’s closed intervals stay aligned. `COMPLETED`
begins the calendar day after return.

## Persisted DB status

Postgres `booking_status` remains:

`draft | confirmed | ongoing | completed | cancelled`

Mapping (Status Service → DB):

| Display   | Persisted |
| --------- | --------- |
| upcoming  | confirmed |
| active    | ongoing   |
| completed | completed |
| cancelled | cancelled |
| draft     | draft     |

Lifecycle values are written on create / update so Conflict indexes and
reporting stay coherent. **Display** always re-resolves from dates + terminal
override so stale rows still render correctly.

Terminal cancel uses `BookingService.deleteBooking` → `softDelete`
(`status = cancelled`).

## Service API

`createBookingStatusService` / `getBookingStatusService` plus pure exports:

| Helper                          | Responsibility                          |
| ------------------------------- | --------------------------------------- |
| `resolveBookingDisplayStatus`   | Display status                          |
| `getBookingStatusPresentation`  | Label, description, badge variant, kind |
| `resolvePersistedBookingStatus` | DB enum for writes                      |
| `isScheduleBlockingBooking`     | Upcoming / active occupy the calendar   |
| `countBookingsByDisplayStatus`  | Dashboard metric aggregates             |
| `toPersistedBookingStatus`      | Display → DB enum                       |

Badge variants (shared design system — do not hardcode colors):

| Display   | Badge variant | Intent |
| --------- | ------------- | ------ |
| Upcoming  | `info`        | Blue   |
| Active    | `success`     | Green  |
| Completed | `secondary`   | Gray   |
| Cancelled | `destructive` | Red    |

## Booking surfaces

### List

`BookingStatusBadge` calls `getBookingStatusPresentation`. Filters use display
statuses; the repository translates lifecycle filters into date predicates.

### Details

Shows badge, Status Service description, and lifecycle vs terminal kind.

### Form

Status is **not** manually editable. Lifecycle updates automatically when
dates change (on save). Edit exposes **Cancel Booking** (terminal action).
Future terminal actions (`no_show`, `closed`) hook into the same terminal path.

### Create / update / cancel

`BookingService` always sets persisted status via Status Service (except
preserving cancelled; draft stays draft until confirmed). Client-supplied
status on update is ignored.

## Availability integration

`resolveAvailabilityFromBookings` delegates hire classification to Status
Service:

| Booking display       | Vehicle availability               |
| --------------------- | ---------------------------------- |
| Upcoming              | Reserved                           |
| Active                | Booked                             |
| Completed / none left | Available                          |
| Cancelled             | Ignored (free unless another hire) |

Do not duplicate delivery/return window logic inside Availability.

## Conflict integration

Overlapping rows are filtered with `isScheduleBlockingBooking` so completed
(by date) hires never block even if the stored enum is still `confirmed`.

## Dashboard

Home dashboard metrics are not yet a dedicated module. When built, use
`countBookingsByDisplayStatus` (or `getBookingStatusService().countByDisplayStatus`)
for:

- Today’s active bookings
- Upcoming bookings
- Completed bookings
- Cancelled bookings

## Database

Keep the existing `booking_status` column for terminals and synced lifecycle
values used by indexes. Do not introduce a second status column. Business
display truth remains the Status Service.

## Future extension points

- Persist `no_show` / `closed` once Postgres enum is extended
- Scheduled job to reconcile persisted lifecycle overnight
- Staff “mark no-show” terminal action on details / form
- Dashboard cards wired to `countBookingsByDisplayStatus`

## Error handling

Invalid date windows still raise friendly `invalid_booking_dates` errors from
Booking Service before status resolution. Missing bookings and DB failures use
existing domain error factories.
