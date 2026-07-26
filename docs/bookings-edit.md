# Edit Booking UI

Phase 4.3 adds the Edit Booking screen at `/bookings/[id]/edit`. It reuses the
same `BookingForm` as Create Booking — only data loading and submission differ.

## Architecture

```
/bookings/[id]/edit (Server Component)
  → getBooking(id) + listVehicles({ isActive })
  → ensure current vehicle is in the select options
  → EditBookingPage
       ├── Breadcrumb + PageHeader
       └── BookingForm mode="edit" (client)
            → React Hook Form (defaultValues from booking)
            → createBookingSchema via validateUpdateBookingForm()
            → updateBooking(id, payload) Server Action
                 → Booking Service → Repository
```

Rules:

1. There is **one** form implementation: `BookingForm` (`mode="create" | "edit"`).
2. Create and Edit pages only differ in server data loading and form props.
3. Validation reuses `@/validations` through shared helpers in `lib/booking-form.ts`.
4. UI never imports Supabase or the booking repository.
5. On success, redirect to the Booking List. The Booking Details workspace is
   available at `/bookings/[id]` (see [bookings-details.md](./bookings-details.md)).

## Route

| Path                  | File                                        |
| --------------------- | ------------------------------------------- |
| `/bookings/[id]/edit` | `src/app/(app)/bookings/[id]/edit/page.tsx` |

Loading UI: `src/app/(app)/bookings/[id]/edit/loading.tsx` → `CreateBookingSkeleton`.

List entry point: row **Edit** action → `bookingEditPath(id)`.

## Reusable BookingForm

| Prop                     | Create                   | Edit                                  |
| ------------------------ | ------------------------ | ------------------------------------- |
| `mode`                   | `"create"`               | `"edit"`                              |
| `vehicles`               | Active + available       | Active (+ current vehicle if missing) |
| `suggestedInvoiceNumber` | Prefill suggestion       | —                                     |
| `bookingId`              | —                        | Existing id                           |
| `bookingStatus`          | —                        | Preserved on update                   |
| `defaultValues`          | Internal create defaults | `bookingToFormValues(booking)`        |
| Submit action            | `createBooking`          | `updateBooking`                       |
| Sticky CTA               | Save Booking             | Update Booking                        |

## Data loading strategy

1. Server Component loads the booking with `getBooking(id)`.
2. `booking_not_found` → Next.js `notFound()`.
3. Other server failures → friendly alert + link back to `/bookings`.
4. Vehicles load with `listVehicles({ isActive: true })`.
5. If the booking’s vehicle is inactive / missing from the list, `getVehicle`
   appends it so the select still shows the current assignment.

## Update workflow

```
Edit fields
  → Client Zod validation (full-form rules)
  → updateBooking(id, payload)
  → Service auth + uniqueness (exclude self) + availability (exclude self)
  → Repository update
  → Success toast
  → Redirect to /bookings
```

Derived fields (duration, total km, amounts) keep the same live calculations as
Create. Status is not edited in the form — the existing booking status is sent
with the update payload.

## Unsaved changes

- React Hook Form `isDirty` tracks edits.
- Browser `beforeunload` warns on refresh / close while dirty.
- Cancel confirms before navigating away when the form is dirty.
- Auto-calculated fields use `shouldDirty: false` so live math alone does not
  mark the form dirty.

## Feature files

```
src/features/bookings/
├── components/
│   ├── booking-form.tsx          ← shared create/edit form
│   ├── create-booking-page.tsx
│   ├── create-booking-form.tsx   ← thin mode="create" wrapper
│   ├── edit-booking-page.tsx
│   └── create-booking-skeleton.tsx
└── lib/
    ├── booking-form.ts           ← defaults, mappers, validation helpers
    └── create-booking-form.ts    ← compatibility re-exports
```

## Related docs

- [Booking Details](./bookings-details.md)
- [Create Booking](./bookings-create.md)
- [Bookings list](./bookings-list.md)
- [Bookings data layer](./bookings-data-layer.md)
- [Types and validation](./types-and-validation.md)
