# Database schema — vehicles & bookings

Phase 3.1 adds the MVP business tables for Silver Carz fleet rentals.
Authentication tables (`profiles`) are documented in
[authentication.md](./authentication.md).

## ER diagram

```
auth.users
    │
    │ 1:1 (ON DELETE CASCADE)
    ▼
public.profiles
    │
    │ created_by (ON DELETE SET NULL)
    │
    │                    public.vehicles
    │                         │
    │                         │ vehicle_id (ON DELETE RESTRICT)
    │                         ▼
    └────────────────► public.bookings
```

Text relationships:

| From            | To                    | Cardinality | On delete | Notes                                    |
| --------------- | --------------------- | ----------- | --------- | ---------------------------------------- |
| `auth.users.id` | `profiles.id`         | 1:1         | CASCADE   | Profile is the app identity row          |
| `vehicles.id`   | `bookings.vehicle_id` | 1:N         | RESTRICT  | Cannot delete a vehicle with bookings    |
| `profiles.id`   | `bookings.created_by` | 1:N         | SET NULL  | Booking history kept if staff is removed |

## Enums

| Enum                   | Values                                                       | Used on                        |
| ---------------------- | ------------------------------------------------------------ | ------------------------------ |
| `fuel_type`            | `petrol`, `diesel`, `cng`, `electric`, `hybrid`              | `vehicles.fuel_type`           |
| `vehicle_availability` | `available`, `booked`, `reserved`, `maintenance`, `inactive` | `vehicles.availability_status` |
| `rental_mode`          | `with_driver`, `without_driver`                              | `bookings.mode`                |
| `payment_method`       | `cash`, `upi`, `card`, `bank_transfer`, `cheque`, `other`    | `bookings.payment_method`      |
| `booking_status`       | `draft`, `confirmed`, `ongoing`, `completed`, `cancelled`    | `bookings.status`              |

Extend enums with `ALTER TYPE … ADD VALUE`. Never rename or reorder existing
values in production.

## Tables

### `public.vehicles`

Fleet inventory. One row per physical vehicle.

| Column                 | Type                   | Notes                                   |
| ---------------------- | ---------------------- | --------------------------------------- |
| `id`                   | `uuid` PK              | `gen_random_uuid()`                     |
| `vehicle_name`         | `text`                 | Display name (non-blank)                |
| `vehicle_number`       | `text` UNIQUE          | Registration / plate (non-blank)        |
| `brand`                | `text`                 | Manufacturer (non-blank)                |
| `model`                | `text`                 | Model name (non-blank)                  |
| `variant`              | `text`                 | Optional trim / variant                 |
| `model_year`           | `integer`              | Optional; 1980–2100                     |
| `color`                | `text`                 | Optional exterior color                 |
| `fuel_type`            | `fuel_type`            | Required enum                           |
| `default_daily_rate`   | `numeric(12,2)`        | ≥ 0; INR default daily hire             |
| `extra_kilometer_rate` | `numeric(12,2)`        | Optional ≥ 0                            |
| `security_deposit`     | `numeric(12,2)`        | Optional ≥ 0                            |
| `current_odometer`     | `numeric(12,2)`        | ≥ 0; default `0`                        |
| `availability_status`  | `vehicle_availability` | Default `available`                     |
| `image_path`           | `text`                 | Storage object path in `vehicle-images` |
| `is_active`            | `boolean`              | Soft-retire without deleting history    |
| `created_at`           | `timestamptz`          | UTC                                     |
| `updated_at`           | `timestamptz`          | Maintained by `set_updated_at` trigger  |

### `public.bookings`

One rental / invoice per row.

| Column                            | Type             | Notes                                          |
| --------------------------------- | ---------------- | ---------------------------------------------- |
| `id`                              | `uuid` PK        | `gen_random_uuid()`                            |
| `invoice_number`                  | `text` UNIQUE    | Human-facing invoice reference                 |
| `vehicle_id`                      | `uuid` FK        | → `vehicles.id`                                |
| `mode`                            | `rental_mode`    | With / without driver                          |
| `customer_name`                   | `text`           | Required                                       |
| `address` … `zip_code`            | `text`           | Optional address fields                        |
| `place_to_visit`                  | `text`           | Trip destination note                          |
| `document_submitted`              | `boolean`        | Default `false`                                |
| `contact_number`                  | `text`           | Optional; non-blank when set                   |
| `invoice_date`                    | `date`           | Defaults to UTC today                          |
| `delivery_date`                   | `date`           | Hire start                                     |
| `return_date`                     | `date`           | Must be ≥ `delivery_date`                      |
| `driver_name`                     | `text`           | Optional (often set when `with_driver`)        |
| `daily_charge`                    | `numeric(12,2)`  | ≥ 0                                            |
| `fuel_range`                      | `text`           | Free-text fuel condition for MVP               |
| `start_odometer` / `end_odometer` | `numeric(12,2)`  | ≥ 0; end ≥ start when both set                 |
| `total_kilometers`                | `numeric(12,2)`  | ≥ 0 when set                                   |
| `duration`                        | `numeric(8,2)`   | Days; > 0 when set                             |
| `kilometer_rate`                  | `numeric(12,2)`  | ≥ 0 when set                                   |
| `booking_amount`                  | `numeric(12,2)`  | ≥ 0                                            |
| `caution_money`                   | `numeric(12,2)`  | ≥ 0                                            |
| `payment_method`                  | `payment_method` | Nullable until payment recorded                |
| `total_amount`                    | `numeric(12,2)`  | ≥ 0                                            |
| `status`                          | `booking_status` | Default `confirmed`                            |
| `notes`                           | `text`           | Free-form                                      |
| `created_by`                      | `uuid` FK        | → `profiles.id`; auto-filled from `auth.uid()` |
| `created_at` / `updated_at`       | `timestamptz`    | UTC                                            |

## Indexes

| Index                                 | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `vehicles_vehicle_number` (unique)    | Exact plate lookup / uniqueness                       |
| `vehicles_is_active_idx`              | Active fleet lists                                    |
| `vehicles_fuel_type_idx`              | Filter by fuel                                        |
| `vehicles_vehicle_name_idx`           | Name sort / equality filters                          |
| `bookings_invoice_number` (unique)    | Invoice lookup                                        |
| `bookings_vehicle_id_idx`             | Bookings for a vehicle                                |
| `bookings_delivery_date_idx`          | Calendar / start-date filters                         |
| `bookings_return_date_idx`            | Calendar / end-date filters                           |
| `bookings_status_idx`                 | Status filters                                        |
| `bookings_customer_name_idx`          | Customer search / sort                                |
| `bookings_invoice_date_idx`           | Reporting by invoice date                             |
| `bookings_created_by_idx`             | Staff activity                                        |
| `bookings_vehicle_conflict_dates_idx` | Partial index for Conflict Engine (confirmed/ongoing) |

> `bookings_vehicle_active_dates_idx` (non-cancelled) was replaced by
> `bookings_vehicle_conflict_dates_idx` in migration
> `20260728170000_booking_conflict_detection_index.sql`.

## Constraints (selected)

- Unique: `vehicle_number`, `invoice_number`
- Date order: `return_date >= delivery_date`
- Money / rates: non-negative amounts and rates
- Odometer: non-negative; `end_odometer >= start_odometer` when both present
- Text fields: non-blank where required (`vehicle_name`, `customer_name`, …)

## RLS policies

Helper: `public.is_active_staff()` — `SECURITY DEFINER`, true when
`current_user_role()` is `owner` or `manager`.

Both tables use `ENABLE` + `FORCE` ROW LEVEL SECURITY.

### `vehicles`

| Policy                  | Command | Rule                |
| ----------------------- | ------- | ------------------- |
| `vehicles_select_staff` | SELECT  | `is_active_staff()` |
| `vehicles_insert_staff` | INSERT  | `is_active_staff()` |
| `vehicles_update_staff` | UPDATE  | `is_active_staff()` |
| `vehicles_delete_staff` | DELETE  | `is_active_staff()` |

### `bookings`

| Policy                  | Command | Rule                |
| ----------------------- | ------- | ------------------- |
| `bookings_select_staff` | SELECT  | `is_active_staff()` |
| `bookings_insert_staff` | INSERT  | `is_active_staff()` |
| `bookings_update_staff` | UPDATE  | `is_active_staff()` |
| `bookings_delete_staff` | DELETE  | `is_active_staff()` |

Anonymous clients have no policies (no access). `service_role` bypasses RLS for
trusted admin / seed work.

Triggers:

- `set_updated_at` on both tables
- `set_booking_created_by` — fills `created_by` from `auth.uid()` on insert
- `protect_booking_created_by` — authenticated clients cannot reassign `created_by`

## Migration notes

| File                                                      | Purpose                                      |
| --------------------------------------------------------- | -------------------------------------------- |
| `20260726120000_create_profiles.sql`                      | Profiles, roles, auth RLS                    |
| `20260726140000_create_vehicles_and_bookings.sql`         | Vehicles, bookings, business RLS             |
| `20260727090000_extend_vehicles_for_creation.sql`         | Vehicle profile fields, availability, images |
| `20260728140000_create_invoice_sequences.sql`             | Yearly invoice counters + atomic RPCs        |
| `20260728150000_sync_invoice_sequences_from_bookings.sql` | Seed counters from existing bookings         |
| `20260728160000_extend_vehicle_availability_statuses.sql` | Adds `reserved` + `inactive` availability    |

Apply order matters: profiles migration first (for `created_by` FK and
`current_user_role()`).

```bash
# Linked Supabase project
pnpm dlx supabase db push

# Or paste the SQL into the Supabase SQL Editor (profiles first)

# Regenerate types
pnpm dlx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

Idempotency: enums use `DO $$ … EXCEPTION WHEN duplicate_object`, tables use
`CREATE TABLE IF NOT EXISTS`, policies are dropped then recreated, functions use
`CREATE OR REPLACE`.

## Out of scope (later)

- Separate `customers` / `drivers` tables (denormalized on bookings for MVP)
- Soft-delete columns beyond `is_active` / `cancelled`
- Hard exclusion constraints for vehicle double-booking (partial index is
  prepared; Availability Engine + overlap queries cover application rules)

See [vehicle-availability.md](./vehicle-availability.md) for lifecycle rules.

Invoice sequences are documented in [invoice-numbering.md](./invoice-numbering.md)
(`invoice_sequences` + `next_invoice_sequence` / `peek_next_invoice_sequence`).
