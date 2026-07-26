# Edit Vehicle UI

Phase 5.3 adds the Edit Vehicle screen at `/vehicles/[id]/edit`. It reuses the
same `VehicleForm` as Add Vehicle — only data loading and submission differ.

## Architecture

```
/vehicles/[id]/edit (Server Component)
  → getVehicle(id)
  → EditVehiclePage
       ├── Breadcrumb + PageHeader
       └── VehicleForm mode="edit" (client)
            → React Hook Form (defaultValues from vehicle)
            → createVehicleSchema via validateUpdateVehicleForm()
            → updateVehicle(id, payload) Server Action
                 → Vehicle Service → Repository
            → uploadVehicleImageAction / removeVehicleImageAction
```

Rules:

1. There is **one** form implementation: `VehicleForm` (`mode="create" | "edit"`).
2. Create and Edit pages only differ in server data loading and form props.
3. Validation reuses `@/validations` through shared helpers in `lib/vehicle-form.ts`.
4. UI never imports Supabase or the vehicle repository.
5. On success, redirect to the Fleet List (`/vehicles`) with a success toast.
6. Image replace / remove stays in Storage actions — field updates omit `image_path`.

## Route

| Path                  | File                                        |
| --------------------- | ------------------------------------------- |
| `/vehicles/[id]/edit` | `src/app/(app)/vehicles/[id]/edit/page.tsx` |

Loading UI: `src/app/(app)/vehicles/[id]/edit/loading.tsx` → `CreateVehicleSkeleton`.

List entry point: row **Edit** action → `vehicleEditPath(id)`.

Breadcrumb: **Fleet Management → Vehicle → Edit**.

## Reusable VehicleForm

| Prop                | Create                   | Edit                              |
| ------------------- | ------------------------ | --------------------------------- |
| `mode`              | `"create"`               | `"edit"`                          |
| `vehicleId`         | —                        | Existing id                       |
| `defaultValues`     | Internal create defaults | `vehicleToFormValues(vehicle)`    |
| `existingImagePath` | —                        | Current `image_path` for preview  |
| Submit action       | `createVehicle`          | `updateVehicle` (+ image actions) |
| Sticky CTA          | Save Vehicle             | Save Changes                      |

Form sections (shared):

1. `vehicle-basic-section.tsx` — name, registration, brand, model, variant, year, color
2. `vehicle-rental-section.tsx` — fuel, daily rate, extra km, deposit
3. `vehicle-operational-section.tsx` — odometer, availability, vehicle status
4. `vehicle-image-section.tsx` — preview / replace / remove

## Data loading strategy

1. Server Component loads the vehicle with `getVehicle(id)`.
2. `vehicle_not_found` → Next.js `notFound()`.
3. Other failures (permission, database, network) → friendly alert + link back to `/vehicles`.
4. Loaded values populate every editable field, including the current image preview.

## Update lifecycle

```
Edit fields
  → Change detection (RHF isDirty + image dirty flag)
  → Client Zod validation (full-form rules)
  → updateVehicle(id, payload) when fields changed
  → Service auth + uniqueness (exclude self) + repository update
  → Optional uploadVehicleImageAction / removeVehicleImageAction
  → Success toast
  → Redirect to /vehicles (full navigation so list shows fresh data)
```

Registration uniqueness allows the current vehicle to keep its own number.
Update payloads intentionally omit `image_path` so normal field saves cannot wipe
Storage references.

## Change detection

- React Hook Form `isDirty` tracks field edits.
- Image selection / removal sets a separate `imageDirty` flag.
- In edit mode, **Save Changes** is disabled when nothing changed.
- Sticky bar shows “No changes detected.” when the form is pristine.
- Submit short-circuits with the same message if somehow triggered with no changes.

## Unsaved changes

- Browser `beforeunload` warns on refresh / close while dirty.
- Cancel confirms before navigating away when the form is dirty (fields or image).
- Warning is skipped while a save is in progress.

## Image management

| Action           | Behavior                                            |
| ---------------- | --------------------------------------------------- |
| Preview existing | Public URL from `existingImagePath`                 |
| Replace          | Local preview → `uploadVehicleImageAction` on save  |
| Remove           | Clears preview → `removeVehicleImageAction` on save |
| Storage disabled | Upload / remove stay abstracted (`skipped` / no-op) |

## Feature files

```
src/features/vehicles/
├── actions/
│   ├── update-vehicle.ts
│   ├── upload-vehicle-image.ts
│   └── remove-vehicle-image.ts
├── components/
│   ├── vehicle-form.tsx                 ← shared create/edit form
│   ├── vehicle-basic-section.tsx
│   ├── vehicle-rental-section.tsx
│   ├── vehicle-operational-section.tsx
│   ├── vehicle-image-section.tsx
│   ├── create-vehicle-form.tsx          ← thin mode="create" wrapper
│   ├── create-vehicle-page.tsx
│   ├── edit-vehicle-page.tsx
│   └── create-vehicle-skeleton.tsx
└── lib/
    └── vehicle-form.ts                  ← defaults, mappers, validation helpers
```

## Related docs

- [Create Vehicle](./vehicles-create.md)
- [Vehicles list](./vehicles-list.md)
- [Vehicles data layer](./vehicles-data-layer.md)
- [Types and validation](./types-and-validation.md)
