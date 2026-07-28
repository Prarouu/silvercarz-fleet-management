# Vehicle Availability Engine

Phase 6.2 introduces a **centralized Availability Engine** that owns fleet
availability state, transitions, and bookability checks. All future modules
(admin booking, customer portal, calendar, reports, dashboard, conflict
detection) must call this service — never reimplement rules in React or
ad-hoc queries.

## Architecture

```
UI / Server Actions / Booking Service / Calendar / Reports
  → Availability Service  (@/features/vehicles/service/availability.service)
      → Vehicle Repository  (read / write availability_status)
      → Booking Repository  (lifecycle bookings for sync)
        → PostgreSQL
```

Rules:

1. UI never calculates availability as the source of truth.
2. Booking lifecycle updates call `syncAvailabilityFromBookings`.
3. Manual staff overrides use `updateAvailability`.
4. Status values live in `@/types/enums` (`VEHICLE_AVAILABILITY_STATUSES`).

## Availability states

| Status        | Label       | Meaning                                    |
| ------------- | ----------- | ------------------------------------------ |
| `available`   | Available   | Vehicle can be booked                      |
| `booked`      | Booked      | Assigned to an active hire (in progress)   |
| `reserved`    | Reserved    | Future confirmed hire exists               |
| `maintenance` | Maintenance | Blocked for maintenance — cannot be booked |
| `inactive`    | Inactive    | Removed from active fleet (soft-retire)    |

Persisted on `vehicles.availability_status` (`public.vehicle_availability`).
Roster flag `vehicles.is_active` remains separate; soft-delete sets both
`is_active = false` and `availability_status = inactive`.

## State transitions (booking lifecycle)

Transitions are centralized in `resolveAvailabilityFromBookings` /
`syncAvailabilityFromBookings` — never hardcode them in UI or actions.

```
Booking created (confirmed, future dates)
  → reserved

Booking starts (delivery ≤ today ≤ return, or status = ongoing)
  → booked

Booking ends (no remaining active / future hires)
  → available

Booking cancelled / deleted
  → available (unless another valid hire remains)
  → reserved or booked (when another hire remains)

Soft-retire vehicle
  → inactive

Staff sets maintenance
  → maintenance (preserved until manually cleared)
```

Manual `maintenance` is preserved during booking sync. Soft-retired /
`inactive` vehicles stay inactive until reactivated.

## Service API

`createAvailabilityService` / `getAvailabilityService`:

| Method                         | Responsibility                                    |
| ------------------------------ | ------------------------------------------------- |
| `getCurrentAvailability`       | Read persisted status                             |
| `updateAvailability`           | Explicit staff override                           |
| `checkAvailability`            | Bookable now? (date-window ready for later)       |
| `getAvailableVehicles`         | Active + `available` list                         |
| `getUnavailableVehicles`       | Active fleet excluding `available`                |
| `assertVehicleBookable`        | Throws friendly errors for maintenance / inactive |
| `syncAvailabilityFromBookings` | Recalculate + persist after booking lifecycle     |
| `resolveStatusFromBookings`    | Pure transition helper (no DB write)              |

`VehicleService.isVehicleAvailable` delegates to `checkAvailability`.

## Booking integration

`BookingService` calls the engine on create / update / soft-delete / hard-delete:

1. `assertVehicleBookable` — blocks maintenance and inactive vehicles.
2. Overlap query — date conflict check (existing repository helper).
3. Persist booking.
4. `syncAvailabilityFromBookings` for affected vehicle id(s).

Friendly messages are returned via `ApiResponse` — never raw Postgres errors.

## UI surfaces

| Surface           | Behavior                                                         |
| ----------------- | ---------------------------------------------------------------- |
| Fleet list badges | `VehicleAvailabilityBadge` — consistent colors per status        |
| Fleet filters     | Availability + Status + Fuel + Active/Inactive                   |
| Create booking    | Lists only `available` active vehicles                           |
| Edit booking      | Active vehicles listed; booked / maintenance / inactive disabled |
| Vehicle form      | Staff can set availability (including reserved / inactive)       |

## Future integration points

- **Customer portal** — call `getAvailableVehicles` / `checkAvailability`.
- **Calendar** — use `resolveStatusFromBookings` with an as-of date.
- **Reports / dashboard** — count by `availability_status`.
- **Booking conflict detection** — extend `checkAvailability` with date windows
  (do not duplicate overlap logic in UI).

## Migration

| File                                                      | Purpose                      |
| --------------------------------------------------------- | ---------------------------- |
| `20260728160000_extend_vehicle_availability_statuses.sql` | Adds `reserved` + `inactive` |

Apply with `pnpm dlx supabase db push`, then regenerate `src/types/database.ts`
if needed (hand-updated for this phase).
