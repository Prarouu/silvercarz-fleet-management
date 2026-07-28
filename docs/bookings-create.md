# Create Booking UI

Phase 4.2 adds the Create Booking screen at `/bookings/new`. Edit Booking reuses
the same form — see [bookings-edit.md](./bookings-edit.md).

## Architecture

```
/bookings/new (Server Component)
  → listVehicles({ isActive, available }) + previewNextInvoiceNumber()
  → CreateBookingPage
       ├── Breadcrumb + PageHeader
       └── BookingForm mode="create" (client)
            → React Hook Form (invoice read-only)
            → createBookingSchema (shared Zod)
            → createBooking() Server Action
                 → Booking Service
                      → InvoiceNumberService.generateNextInvoiceNumber()
                      → Repository
```

Rules:

1. The route loads active vehicles and a non-allocating invoice preview on the server.
2. The client form owns UX state, derived calculations, and submission.
3. Validation reuses `@/validations` (`createBookingSchema`) — no duplicated rules.
4. UI never imports Supabase or the booking repository.
5. On success, redirect to the Booking List.
6. Create and Edit share one `BookingForm` component; mode props control differences.
7. Invoice numbers are read-only; allocation happens once in the booking service.

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

Sticky action bar (in-flow, safe-area aware): **Cancel** | **Save Booking**.

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
  → createBooking(payload)   // invoice_number omitted from client
  → Service allocates invoice via InvoiceNumberService (once)
  → Uniqueness + availability + derived fields
  → Repository insert
  → Success toast (shows final invoice)
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

Invoice number is previewed on the server via `peek_next_invoice_sequence` and
shown in a read-only field. The authoritative number is allocated once on save
through `next_invoice_sequence`. See [invoice-numbering.md](./invoice-numbering.md).

## Vehicle selector

Active (and `available`) vehicles are loaded via `listVehicles` and passed as
options. The select is disabled when none are available.

## Feature files

```
src/features/bookings/
├── components/
│   ├── booking-form.tsx
│   ├── create-booking-page.tsx
│   ├── create-booking-form.tsx
│   ├── create-booking-skeleton.tsx
│   ├── booking-form-section.tsx
│   └── booking-form-field.tsx
└── lib/
    ├── booking-form.ts
    └── create-booking-form.ts
```

## Related docs

- [Booking Module UI](./bookings-ui.md)
- [Edit Booking](./bookings-edit.md)
- [Bookings list](./bookings-list.md)
- [Bookings data layer](./bookings-data-layer.md)
- [Types and validation](./types-and-validation.md)
