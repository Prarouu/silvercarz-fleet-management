# Types & validation architecture

Phase 3.2 defines the shared TypeScript models and Zod schemas that booking,
vehicle, and auth features must reuse. No UI or CRUD lives here.

## Layers

```
src/types/database.ts     ← generated Supabase schema (source of truth for columns)
       │
       ├── enums.ts        ← FuelType, BookingStatus, … (+ labels / options)
       ├── vehicle.ts      ← Vehicle / VehicleCreateInput / VehicleUpdateInput
       ├── booking.ts      ← Booking / BookingCreateInput / …
       ├── auth.ts         ← re-exports AuthUser, UserProfile from @/lib/auth
       └── common.ts       ← ApiResponse helpers, SelectOption, …

src/validations/
       ├── common.ts       ← email, phone, uuid, pagination primitives
       ├── shared.ts       ← money, dates, invoice/vehicle numbers, enum schemas
       ├── vehicle.ts      ← createVehicleSchema / updateVehicleSchema
       └── booking.ts      ← createBookingSchema / updateBookingSchema

src/features/bookings/types.ts   ← re-exports @/types (+ validation via index)
src/features/vehicles/types.ts   ← re-exports @/types (+ validation via index)
```

## Generated database types

`src/types/database.ts` mirrors Postgres (`profiles`, `vehicles`, `bookings`,
enums, RPCs). Regenerate after migrations:

```bash
pnpm dlx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

**Rules:**

1. Never hand-write parallel interfaces for table columns.
2. Domain entities alias generated helpers:
   - `Vehicle = Tables<'vehicles'>`
   - `VehicleCreateInput = TablesInsert<'vehicles'>`
   - `VehicleUpdateInput = TablesUpdate<'vehicles'>`
   - same pattern for `Booking`
3. Auth app shapes (`AuthUser`, `UserProfile`) stay camelCase in
   `@/lib/auth/types` and are re-exported from `@/types/auth`.

## Enums

Import from `@/types` or `@/types/enums`:

| Type            | Postgres enum    | Constants                  |
| --------------- | ---------------- | -------------------------- |
| `FuelType`      | `fuel_type`      | `FUEL_TYPES`               |
| `RentalMode`    | `rental_mode`    | `RENTAL_MODES`             |
| `PaymentMethod` | `payment_method` | `PAYMENT_METHODS`          |
| `BookingStatus` | `booking_status` | `BOOKING_STATUSES`         |
| `UserRole`      | `app_role`       | `USER_ROLES` (`APP_ROLES`) |

Each enum exposes `*_VALUES`, `*_LABELS`, `*_OPTIONS` (`SelectOption[]`), and
an `is*` type guard. Prefer constants over raw strings in UI and services.

## Domain models

| Model                            | Meaning                     |
| -------------------------------- | --------------------------- |
| `Vehicle`                        | Persisted vehicle row       |
| `VehicleCreateInput`             | Insert payload              |
| `VehicleUpdateInput`             | Update payload              |
| `VehicleListFilters`             | Shared list filter shape    |
| `VehicleListQuery`               | Filters + sort + pagination |
| `VehicleAvailabilityQuery`       | Future availability input   |
| `Booking`                        | Persisted booking row       |
| `BookingCreateInput`             | Insert payload              |
| `BookingUpdateInput`             | Update payload              |
| `BookingWithVehicle`             | Booking + nested `vehicle`  |
| `BookingListFilters`             | Shared list filter shape    |
| `AuthUser` / `AuthenticatedUser` | App session user            |
| `UserProfile`                    | Profile / RBAC row          |

Column names on booking/vehicle models match the database (**snake_case**) so
validated values can be passed to Supabase without remapping.

## Validation

Import schemas from `@/validations`.

### Shared primitives (`shared.ts` + `common.ts`)

- Required / optional strings, email, phone, UUID
- ISO dates (`YYYY-MM-DD`), Indian PIN (`zipCodeSchema`)
- Money (`moneySchema`, `positiveMoneySchema`)
- Odometer / non-negative numbers
- Invoice + vehicle number (trim + normalize)
- Enum schemas (`fuelTypeSchema`, `bookingStatusSchema`, …)
- Cross-field helpers: `refineDateRange`, `refineOdometerRange`
- Consistent copy in `VALIDATION_MESSAGES`

### Domain schemas

| Schema                | Use for                        |
| --------------------- | ------------------------------ |
| `createVehicleSchema` | Create vehicle forms / actions |
| `updateVehicleSchema` | Partial vehicle updates        |
| `createBookingSchema` | Create booking forms / actions |
| `updateBookingSchema` | Partial booking updates        |
| `*ListFiltersSchema`  | Query / filter params          |

Auth credential schemas remain in `features/auth/validations` (login-specific)
and already compose `@/validations` primitives.

Inferred form types (`CreateBookingValues`, …) come from Zod. Entity types
(`Booking`, `Vehicle`) come from generated tables. Do not invent a third shape.

## How future features should consume this

```ts
// Types
import type { Booking, BookingCreateInput, Vehicle } from '@/types';
import { BOOKING_STATUSES, FUEL_TYPES } from '@/types';

// Validation (forms, Server Actions, API routes)
import { createBookingSchema, createVehicleSchema } from '@/validations';

// Feature-local convenience
import type { Booking } from '@/features/bookings';
import { createBookingSchema } from '@/features/bookings';
```

Guidelines:

1. Compose new field rules from `@/validations` — do not copy regexes.
2. Add feature-only types under `features/<name>/types` only when they are not
   shared; promote to `@/types` when a second consumer appears.
3. Keep DB column names on create/update payloads until a dedicated mapper is
   justified.
4. Never redefine `Vehicle` / `Booking` interfaces beside the generated aliases.

## Out of scope

- CRUD services, Server Actions, React forms / pages
- Runtime mappers between camelCase UI models and snake_case rows
- Separate customer / driver entities (still fields on `bookings`)
