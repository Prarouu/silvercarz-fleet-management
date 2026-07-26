# Create Booking UI

Phase 4.2 adds the Create Booking screen at `/bookings/new`. Edit and detail
flows are **not** included.

## Architecture

```
/bookings/new (Server Component)
  → listVehicles({ isActive, available }) + countBookings()
  → CreateBookingPage
       ├── Breadcrumb + PageHeader
       └── CreateBookingForm (client)
            → React Hook Form
            → createBookingSchema (shared Zod)
            → createBooking() Server Action
                 → Booking Service → Repository
```

Rules:

1. The route loads active vehicles and a suggested invoice number on the server.
2. The client form owns UX state, derived calculations, and submission.
3. Validation reuses `@/validations` (`createBookingSchema`) — no duplicated rules.
4. UI never imports Supabase or the booking repository.
5. On success, redirect to the Booking List (details route does not exist yet).

## Route

| Path            | File                                  |
| --------------- | ------------------------------------- |
| `/bookings/new` | `src/app/(app)/bookings/new/page.tsx` |

Loading UI: `src/app/(app)/bookings/new/loading.tsx` → `CreateBookingSkeleton`.

List entry point: **New Booking** on `/bookings` links to `ROUTES.bookingsNew`.

## Form sections

1. **Booking Information** — invoice number, rental mode, invoice date
2. **Customer Information** — name, contact, address, city, state, ZIP, documents
3. **Trip Information** — vehicle, driver, place, delivery / return dates
4. **Pricing** — daily charge, duration, fuel, odometer, km total, km rate
5. **Payment** — booking amount, caution money, payment method, total amount
6. **Notes** — optional multi-line notes

Sticky action bar: **Cancel** | **Save Booking**.

## Validation flow

1. User blurs / submits fields (RHF `mode: 'onBlur'`).
2. Submit runs `validateCreateBookingForm()` which maps form values and calls
   `createBookingSchema.safeParse(...)`.
3. Field errors are applied with `setError`; a top-level alert summarizes failure.
4. The Server Action / service re-validates the same schema before persistence.

Friendly server errors (duplicate invoice, vehicle unavailable, validation) are
surfaced without raw database messages.

## Submission flow

```
Fill form
  → Client Zod validation
  → createBooking(payload)
  → Service auth + uniqueness + availability + derived fields
  → Repository insert
  → Success toast
  → Redirect to /bookings
```

On failure, form values are preserved and the sticky bar re-enables Save.

## Automatic calculations

Reusable helpers from `booking-calculations.ts`:

| Field            | Source                                                |
| ---------------- | ----------------------------------------------------- |
| Duration         | Inclusive days from delivery → return                 |
| Total kilometers | `end_odometer - start_odometer` when both set         |
| Booking amount   | `(daily_charge × duration) + (km_rate × total_km)`    |
| Total amount     | Equals booking amount for MVP (caution kept separate) |

Invoice number is prefilled with `buildInvoiceNumberSuggestion` from booking
count + 1. Staff can edit it; automatic sequencing can replace the suggestion
later without changing the field.

## Vehicle selector

Active (and `available`) vehicles are loaded via `listVehicles` and passed as
options. The select is disabled when none are available.

## Feature files

```
src/features/bookings/
├── components/
│   ├── create-booking-form.tsx
│   ├── create-booking-page.tsx
│   ├── create-booking-skeleton.tsx
│   ├── booking-form-section.tsx
│   └── booking-form-field.tsx
└── lib/
    └── create-booking-form.ts
```

## Related docs

- [Bookings list](./bookings-list.md)
- [Bookings data layer](./bookings-data-layer.md)
- [Types and validation](./types-and-validation.md)
