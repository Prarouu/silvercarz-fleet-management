# Admin Dashboard

Production Admin Dashboard for Silver Carz Fleet Management. This is the
post-login landing page and the primary operations overview.

## Routes

| Path         | Role                                      |
| ------------ | ----------------------------------------- |
| `/dashboard` | Admin Dashboard (primary)                 |
| `/`          | Redirects to `/dashboard`                 |
| Post-login   | Defaults to `/dashboard` via route guards |

Feature module: `src/features/dashboard/`

## Architecture

```
app/(app)/dashboard/page.tsx          (thin Server Component)
  → getDashboardData() Server Action
      → DashboardService
          → Booking Repository (counts, recent, overlapping)
          → Vehicle Repository (counts, fleet list)
          → Availability Service (syncAll before read)
          → Status Service (display status for schedule / snapshot)
  → DashboardPage (composition)
      → KPI cards, charts, schedule, fleet snapshot, recent table
```

Rules:

1. **Thin routes** — no business logic in `app/`.
2. **No duplicated engines** — lifecycle status comes from Status Service;
   fleet availability from Availability Service / repository counts.
3. **Parallel reads** — KPI counts, charts, schedule, recent bookings, and
   fleet snapshot load in a single `Promise.all` after one availability sync.
4. **Server Components by default** — charts, live clock, motion, and row
   navigation use client components only where required.

## Data sources

| Surface                  | Source                                                             |
| ------------------------ | ------------------------------------------------------------------ |
| Active / Upcoming KPIs   | `bookingRepo.count({ status })` (display-status filters)           |
| Available / Total fleet  | `vehicleRepo.count({ available })` / `{ includeInactive: true }`   |
| Today's pickups/returns  | Overlapping bookings for today, filtered by delivery / return date |
| Booking status chart     | Counts for upcoming, active, completed, cancelled                  |
| Fleet availability chart | Counts per `vehicle_availability` status                           |
| Today's schedule         | `findOverlappingInRange` for today, sorted by pickup               |
| Recent bookings          | `list` latest 10 by `created_at` desc                              |
| Fleet snapshot           | Active vehicles + horizon overlaps → current / next booking        |

## Reusable KPI cards

`KpiCard` (`features/dashboard/components/kpi-card.tsx`) is the shared metric
tile:

- Animated entrance (Framer Motion)
- Hover elevation
- Optional `href` for future drill-downs
- Accessible label with count + description

`DashboardKpiGrid` wires the six operational metrics.

## Chart architecture

Charts use **Recharts** and **Admin Theme CSS variables** only:

- `var(--chart-1)` … `var(--chart-5)` via `lib/chart-colors.ts`
- Booking status → pie (Upcoming, Active, Completed, Cancelled)
- Fleet availability → horizontal bars (Available, Booked, Reserved,
  Maintenance, Inactive)

Never hardcode hex colors in chart JSX.

## UI composition (desktop)

1. Header (greeting + live clock)
2. Welcome hero card
3. Quick actions
4. Six KPI cards
5. Two-column charts
6. Today's Schedule + Fleet Snapshot
7. Recent Bookings table

Tablet uses adaptive grids; mobile stacks sections and turns the recent table
into card rows.

## Empty / loading / error

| State   | Behavior                                          |
| ------- | ------------------------------------------------- |
| Empty   | Friendly CTA to add vehicles / create bookings    |
| Loading | `DashboardSkeleton` — layout-stable placeholders  |
| Error   | Shared `ErrorState` with retry (`router.refresh`) |

## Future extension points

- Per-KPI date range filters / revenue tiles (Pricing Engine)
- Drill-down query params beyond current status filters
- WebSocket / polling for live occupancy
- Role-scoped dashboard widgets (Owner vs Manager)
- Export / print summary

## Dependencies added

- `recharts` — charts
- `framer-motion` — light section / card motion
