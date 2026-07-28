# Fleet Availability Calendar

Phase 6.6 introduces the **Fleet Availability Calendar** — the scheduling
foundation for admin operations and future Customer Portal, Reports,
Notifications, and Dashboard surfaces.

Route: [`/calendar`](<../src/app/(app)/calendar/page.tsx>)  
Feature: [`src/features/calendar/`](../src/features/calendar/)

## Goals

Managers can instantly see:

- Which vehicles are booked vs available
- Upcoming pickups and returns
- Vehicle occupancy across a date window

This module is **read / navigate only**. It does not edit bookings, does not
drag-and-drop schedules, and does not invent availability or status rules.

## Architecture

```
UI (CalendarPage)
  → Server Action getCalendarData
    → CalendarService
        → BookingRepository.findOverlappingInRange  (viewport bookings)
        → VehicleRepository.list / count            (fleet + filters)
        → AvailabilityService.syncAll…              (self-heal + resolve)
        → Status Engine (presentation / metrics)
        → Pricing Engine (outstanding balance)
```

### Layering rules

| Layer                                      | Responsibility                                         |
| ------------------------------------------ | ------------------------------------------------------ |
| `app/(app)/calendar`                       | Thin route — parse URL, call action, render feature UI |
| `features/calendar/actions`                | Server Actions only                                    |
| `features/calendar/service`                | Orchestration + view-model assembly                    |
| Booking / Vehicle repositories             | Persistence (overlap queries, fleet lists)             |
| Status / Availability / Conflict / Pricing | Business rules (never duplicated here)                 |

UI never imports repositories.

## Scheduling flow

1. URL state (`view`, `date`, filters) → `toCalendarQuery`.
2. Resolve inclusive ISO range (`resolveCalendarRange`).
3. Sync vehicle availability via Availability Engine.
4. Load active fleet (fuel / availability / vehicle filters).
5. Load bookings that **overlap** the visible range only
   (`delivery_date <= rangeEnd AND return_date >= rangeStart`).
6. Map bookings → calendar events with Status Engine presentation.
7. Build fleet timeline occupancy using Status schedule-blocking rules +
   Availability Engine `resolveAvailabilityFromBookings`.
8. Build upcoming pickups / returns from a short future horizon.

## Data loading strategy

- **Lazy / range-scoped** — never load full booking history.
- Soft caps: calendar viewport ≤ 500 rows; agenda horizon ≤ 300 rows.
- Default view: **Week** (Mon–Sun). Day and Month supported.
- Year view is reserved in types (`CALENDAR_VIEWS.year`) but not rendered.
- Optional `from` / `to` URL params override the view-derived range for data.

## Event presentation

Each event shows:

- Vehicle name + registration
- Customer name
- Pickup / return dates
- Status label

**Colors** come from `getBookingStatusPresentation(…).badgeVariant` mapped
through `CALENDAR_EVENT_VARIANT_CLASSES`. UI must not hardcode status → color.

Clicking an event opens Booking Details (`bookingDetailPath`) — no inline edit.

## Occupancy calculation (Fleet Timeline)

Rows = filtered vehicles. Columns = dates in the visible range.

For each booking intersecting the viewport:

1. Skip cancelled / draft (Status Engine).
2. Clip the hire interval to the visible range.
3. Include schedule-blocking hires (`upcoming` / `active`) and completed
   blocks that still intersect the viewport.
4. Place an occupancy block colored by Status badge variant.
5. Row availability badge = `resolveAvailabilityFromBookings(vehicle, bookings, asOfDate)`.

## Summary cards

| Tile                       | Source                                         |
| -------------------------- | ---------------------------------------------- |
| Available Vehicles         | Availability Engine / vehicle counts           |
| Booked Vehicles            | `booked` + `reserved` availability counts      |
| Today's Pickups / Returns  | Bookings with delivery/return = today          |
| Active / Upcoming Bookings | `countBookingsByDisplayStatus` (Status Engine) |

## Filters

Reusable URL filters (same pattern as bookings / vehicles toolbars):

- Vehicle, Availability, Booking Status, Driver, Fuel Type
- Date range (`from` / `to`)
- Search (invoice, customer, contact, vehicle number)

## Responsiveness

| Breakpoint               | Calendar surface                            |
| ------------------------ | ------------------------------------------- |
| Desktop / tablet (`md+`) | Day / Week / Month grid                     |
| Mobile                   | Agenda / list view (`CalendarMobileAgenda`) |

Avoid relying on horizontal scroll for the primary calendar; the fleet
timeline may scroll horizontally when many days are visible.

## Accessibility

- Semantic sections with `aria-label`
- Keyboard-focusable event links with visible focus rings
- View switcher uses `role="tablist"` / `aria-selected`
- Status announced via badge `aria-label`

## Future drag-and-drop extension

When drag-and-drop scheduling is added:

1. Keep CalendarService as the read model.
2. On drop, call existing Booking Service `updateBooking` with new
   delivery / return dates — **do not** write from the calendar UI.
3. Reuse Conflict Service `assertNoConflict` / `detectConflicts` before save.
4. Reuse Availability Service after persist (already wired in Booking Service).
5. Optimistic UI may preview placement, but persistence stays in Booking Service.

Do not fork overlap math into the calendar feature.

## Empty / loading states

- Empty: professional `EmptyState` with **Create Booking** CTA.
- Loading: `CalendarSkeleton` via `loading.tsx` (avoids layout shift).

## Related docs

- [Vehicle Availability Engine](./vehicle-availability.md)
- [Booking Conflict Detection](./booking-conflict-detection.md)
- [Booking Status Automation](./booking-status-automation.md)
- [Booking Pricing Engine](./booking-pricing-engine.md)
- [Shared Architecture](./architecture.md)
