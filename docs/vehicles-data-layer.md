# Vehicles data layer

Phase 3.4 implements the vehicle backend stack. There is **no vehicle UI** in
this phase — only repository, service, Server Actions, and domain errors.

## Data flow

```
UI (future)
  → Server Actions   (@/features/vehicles/actions)
    → Vehicle Service  (@/features/vehicles/service)
      → Vehicle Repository (@/features/vehicles/repository)
        → Supabase client (@/lib/supabase/server)
          → PostgreSQL (RLS + constraints)
```

Rules:

1. UI never imports Supabase clients or the repository.
2. Server Actions never contain SQL / business rules — they delegate to the service.
3. The service owns validation, authorization, uniqueness, and soft-delete rules.
4. The repository owns persistence only.

## Folder layout

```
src/features/vehicles/
├── actions/           # Next.js Server Actions (thin)
├── repository/        # Supabase queries
├── service/           # Business logic + ApiResponse orchestration
├── errors.ts          # Domain AppError factories
├── types.ts           # Re-exports from @/types
└── index.ts           # Public feature barrel
```

## Repository pattern

`createVehicleRepository(client)` accepts a `TypedSupabaseClient` so a future
transaction / unit-of-work can inject one client for multiple writes.

| Method            | Persistence behavior                             |
| ----------------- | ------------------------------------------------ |
| `create`          | Insert row                                       |
| `update`          | Patch by id                                      |
| `softDelete`      | Set `is_active = false` (preferred)              |
| `delete`          | Hard delete                                      |
| `findById`        | Single-row read                                  |
| `findByNumber`    | Exact plate / registration lookup                |
| `list` / `search` | Filters + sort + offset pagination + total count |
| `count`           | Head count with same filters                     |

Search fields: vehicle name, vehicle number, fuel type (exact enum match when
the term is a known fuel), and status (`active` / `inactive`).

Inactive vehicles are excluded by default (`includeInactive: true` to opt in,
or set `isActive` explicitly). `cursor` on `VehicleListQuery` is reserved for
future keyset pagination.

### Filters

| Filter                      | Behavior                                             |
| --------------------------- | ---------------------------------------------------- |
| `fuelType`                  | Exact `fuel_type` match                              |
| `isActive`                  | Exact active flag                                    |
| `includeInactive`           | When true and `isActive` unset, include retired rows |
| `available`                 | Architecture: currently requires `is_active = true`  |
| `createdFrom` / `createdTo` | Inclusive created-date window                        |
| `search`                    | Free-text OR across name / number / fuel / status    |

### Sorting

Supported `sortBy` values: `vehicle_name`, `vehicle_number`, `fuel_type`,
`created_at`, `updated_at`. Default: `created_at` descending.

## Service pattern

`createVehicleService({ repository?, client?, requirePermission? })` supports
tests and alternate clients. Default `getVehicleService()` uses the request
server client and live auth.

Responsibilities:

- Zod validation (`createVehicleSchema`, `updateVehicleSchema`, list/search schemas)
- Permission checks (`vehicles:read` / `vehicles:write` / `vehicles:delete`)
- Vehicle number uniqueness (normalized uppercase, no spaces)
- Soft-delete rules (`is_active → false`)
- Availability helper (active check only — booking conflicts later)
- `requireActiveVehicle` for future hire / booking flows

Public methods return `ApiResponse<T>` via `fromPromise` — never raw Supabase
errors.

## Server Actions

| Action               | Service method         |
| -------------------- | ---------------------- |
| `createVehicle`      | `createVehicle`        |
| `updateVehicle`      | `updateVehicle`        |
| `deleteVehicle`      | `deleteVehicle` (soft) |
| `getVehicle`         | `getVehicle`           |
| `getVehicleByNumber` | `getVehicleByNumber`   |
| `listVehicles`       | `listVehicles`         |
| `searchVehicles`     | `searchVehicles`       |
| `countVehicles`      | `countVehicles`        |

Import from `@/features/vehicles` or `@/features/vehicles/actions`.

## Authorization

Permissions added in `@/lib/auth/permissions`:

- `vehicles:read`
- `vehicles:write`
- `vehicles:delete`

Owner and Manager currently grant `'all'`, so both roles pass. Narrow the matrix
later without changing service call sites (`requirePermission(...)`).

## Error handling

Domain codes in `VEHICLE_ERROR_CODES`:

| Code                          | When                          |
| ----------------------------- | ----------------------------- |
| `vehicle_not_found`           | Missing id / number           |
| `duplicate_vehicle_number`    | Unique registration conflict  |
| `inactive_vehicle`            | Active vehicle required       |
| `unauthorized_vehicle_access` | Reserved for finer ACL        |
| `database_failure`            | Unexpected persistence errors |
| `validation`                  | Zod / input failures          |

UI should read `ApiResponse.error.message` only — never PostgREST payloads.

## Business rules

1. Vehicle number must be unique (service check + DB unique constraint).
2. Invalid payloads are rejected by Zod before persistence.
3. Default listings hide inactive vehicles.
4. Soft delete preferred over hard delete (FK `ON DELETE RESTRICT` from bookings).
5. Availability architecture is ready via `isVehicleAvailable` /
   `VehicleAvailabilityQuery` — date-range conflict detection is deferred.

## Future extension points

1. **DB transactions** — pass one `TypedSupabaseClient` into repository + related writers.
2. **Cursor pagination** — honor `VehicleListQuery.cursor` beside offset/`range`.
3. **Booking conflicts** — extend `isVehicleAvailable` / `available` filter using
   booking overlap queries (do not implement in vehicle UI yet).
4. **Maintenance history** — attach service methods without changing action signatures.
5. **Fuel logs** — same orchestration point as maintenance.
6. **Insurance / servicing reminders** — schedule helpers on the service layer.
7. **Role divergence** — remove `'all'` from managers for `vehicles:delete` when needed.
8. **UI** — pages call Server Actions only; no repository imports in components.

## Related docs

- [Database schema](./database.md)
- [Types & validation](./types-and-validation.md)
- [Bookings data layer](./bookings-data-layer.md)
- [Authentication](./authentication.md)
