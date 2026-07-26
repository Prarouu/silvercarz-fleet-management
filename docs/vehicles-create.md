# Create Vehicle UI

Phase 5.2 adds the Add Vehicle screen at `/vehicles/new`. It shares `VehicleForm`
with Edit Vehicle (`mode="create" | "edit"`). Vehicle Details remain deferred.

## Architecture

```
/vehicles/new (Server Component)
  → CreateVehiclePage
       ├── Breadcrumb + PageHeader
       └── VehicleForm mode="create" (client)
            → React Hook Form
            → createVehicleSchema (shared Zod)
            → createVehicle() Server Action
                 → Vehicle Service → Repository
            → uploadVehicleImageAction() (optional image)
                 → vehicle-image-storage → Supabase Storage
                 → setVehicleImagePath(...)
```

Rules:

1. The route is a thin Server Component; the client form owns UX state and submission.
2. There is **one** form: `VehicleForm`. Create is `mode="create"`.
3. Validation reuses `@/validations` (`createVehicleSchema`) — no duplicated rules.
4. UI never imports Supabase or the vehicle repository.
5. On success, redirect to the Fleet List (`/vehicles`) with a success toast.
6. Image upload is isolated in `vehicle-image-storage` so Storage can be toggled
   without rewriting the form (`VEHICLE_IMAGE.uploadEnabled`).

## Route

| Path            | File                                  |
| --------------- | ------------------------------------- |
| `/vehicles/new` | `src/app/(app)/vehicles/new/page.tsx` |

Loading UI: `src/app/(app)/vehicles/new/loading.tsx` → `CreateVehicleSkeleton`.

List entry point: **Add Vehicle** on `/vehicles` links to `ROUTES.vehiclesNew`.

## Form sections

1. **Basic Information** — name, registration, brand, model, variant, year, color
2. **Rental Information** — fuel type, daily rate, extra km rate, security deposit
3. **Operational Information** — odometer, availability status, vehicle status
4. **Vehicle Image** — optional single image with local preview

Sticky action bar (in-flow, safe-area aware): **Cancel** | **Save Vehicle**.

## Validation flow

1. User blurs / submits fields (RHF `mode: 'onBlur'`).
2. Submit runs `validateCreateVehicleForm()` which maps form values and calls
   `createVehicleSchema.safeParse(...)`.
3. Field errors are applied with `setError`; a top-level alert summarizes failure.
4. The Server Action / service re-validates the same schema before persistence.
5. Registration uniqueness is enforced in the service (and by the DB unique constraint).

Friendly server errors (duplicate registration, validation, database, storage)
are surfaced without raw database messages.

### Required fields

| Field               | Rule                                 |
| ------------------- | ------------------------------------ |
| Vehicle name        | Non-blank, trimmed                   |
| Registration number | Normalized uppercase, unique         |
| Brand / model       | Non-blank, trimmed                   |
| Fuel type           | Enum                                 |
| Default daily rate  | ≥ 0                                  |
| Current odometer    | ≥ 0                                  |
| Availability status | Enum (default `available`)           |
| Vehicle status      | Maps to `is_active` (default Active) |

Optional: variant, model year, color, extra km rate, security deposit, image.

## Automatic form features

- Submit disabled while saving (`isSubmitting` / `useTransition`)
- Duplicate submissions prevented by the same loading gate
- `beforeunload` + Cancel confirm when dirty (including selected image)
- Text inputs trimmed via Zod `requiredString` / `optionalNullableStringSchema`
- Registration normalized to uppercase (spaces removed) as the user types

## Image upload abstraction

| Piece                      | Role                                             |
| -------------------------- | ------------------------------------------------ |
| `VEHICLE_IMAGE` constants  | Bucket name, MIME types, 5 MB limit, enable flag |
| `VehicleImageField`        | Client preview, replace, remove                  |
| `vehicle-image-storage.ts` | Validate + upload / remove against Storage       |
| `uploadVehicleImageAction` | Server Action: upload then patch `image_path`    |

Supported MIME types: JPG, PNG, WEBP.

If `VEHICLE_IMAGE.uploadEnabled` is `false`, the form still collects a previewable
file; upload is a no-op (`skipped: true`) and the vehicle row is created without
an image path. Flip the flag after the Storage bucket migration is applied.

DB column: `vehicles.image_path` stores the object path (not a full URL).

## Submission flow

```
Fill form
  → Client Zod validation
  → createVehicle(payload)
  → Service auth + uniqueness + insert
  → Optional uploadVehicleImageAction(vehicleId, FormData)
  → Success toast
  → Redirect to /vehicles
```

On create failure, form values are preserved and Save re-enables. If create
succeeds but image upload fails, the vehicle remains saved and the user sees a
warning toast about the image.

## Feature files

```
src/features/vehicles/
├── actions/
│   ├── create-vehicle.ts
│   └── upload-vehicle-image.ts
├── components/
│   ├── vehicle-form.tsx                 ← shared create/edit form
│   ├── vehicle-basic-section.tsx
│   ├── vehicle-rental-section.tsx
│   ├── vehicle-operational-section.tsx
│   ├── vehicle-image-section.tsx
│   ├── create-vehicle-page.tsx
│   ├── create-vehicle-form.tsx          ← thin mode="create" wrapper
│   ├── create-vehicle-skeleton.tsx
│   ├── vehicle-breadcrumb.tsx
│   └── vehicle-image-field.tsx
└── lib/
    ├── vehicle-form.ts
    └── vehicle-image-storage.ts
```

Shared form shells: `components/shared/form-field.tsx`, `form-section.tsx`.

## Related docs

- [Edit Vehicle UI](./vehicles-edit.md)
- [Vehicles list UI](./vehicles-list.md)
- [Vehicles data layer](./vehicles-data-layer.md)
- [Database schema](./database.md)
- [Types & validation](./types-and-validation.md)
