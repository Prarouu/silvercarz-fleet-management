# Centralized Pricing Engine

Phase 6.5 introduces a **centralized Pricing Engine** that owns every monetary
calculation related to bookings. UI never invents hire math. Booking Service
persists snapshots produced by the engine; detail and form surfaces rematerialize
or preview through the same API.

## Architecture

```
UI (Booking Form / Details) / Booking Service / future Invoice / Reports
  → Pricing Service  (@/features/bookings/service/pricing.service)
      → Pure formulas (duration, km, charges, balance)
  → Booking Service (writes snapshots on create / update)
      → Booking Repository
        → PostgreSQL (`bookings` money + distance columns)
```

Rules:

1. Pricing Engine is the **single source of truth** for rental days, kilometer
   totals, rental charge, km charge, subtotal, grand total, and remaining balance.
2. UI may call `previewPricing` / `pricingFromBooking` for display — never copy
   formulas into components.
3. Security deposit (`caution_money`) is tracked separately and is **never**
   subtracted from remaining balance unless a future business rule says so.
4. Currency symbols are never hardcoded — display via `@/lib/format`
   (`formatCurrency` / app config).

## Inputs

| Input                   | Source column / field                             |
| ----------------------- | ------------------------------------------------- |
| Daily rate              | `daily_charge` / vehicle `default_daily_rate`     |
| Extra kilometer rate    | `kilometer_rate` / vehicle `extra_kilometer_rate` |
| Delivery / return       | `delivery_date`, `return_date`                    |
| Start / end odometer    | `start_odometer`, `end_odometer`                  |
| Amount paid             | `booking_amount`                                  |
| Security deposit        | `caution_money`                                   |
| Included KM (future)    | not persisted yet                                 |
| Discount / GST (future) | not persisted yet                                 |

## Formulas

| Output            | Formula                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Rental days       | Inclusive calendar span (`return − delivery + 1`), floor **1**    |
| Total kilometers  | `end_odometer − start_odometer` (null until both readings exist)  |
| Chargeable KM     | `max(0, total − included)` — today `included = 0` so equals total |
| Rental charge     | `daily_rate × rental_days`                                        |
| KM charge         | `chargeable_km × extra_kilometer_rate`                            |
| Subtotal          | `rental_charge + km_charge`                                       |
| Taxable amount    | `max(0, subtotal − discount)` (discount = 0 today)                |
| GST amount        | `taxable × gst_rate` (gst_rate = 0 today)                         |
| Grand total       | `taxable + gst`                                                   |
| Remaining balance | `grand_total − amount_paid` (**not** minus security deposit)      |

All money values pass through `roundMoney` (2 decimal places) for consistent
paise rounding and future GST alignment.

## Return object (`PricingSummary`)

- `rentalDays`, `dailyRate`, `rentalCharge`
- `totalKilometers`, `includedKilometers`, `extraKilometers`, `chargeableKilometers`
- `kilometerRate`, `kilometerCharge`
- `subtotal`, `discountAmount`, `taxableAmount`, `gstRate`, `gstAmount`
- `grandTotal`, `amountPaid`, `securityDeposit`, `remainingBalance`

## Persistence strategy

Persist **inputs** and **invoice snapshots** staff expect on the booking row.
Do **not** add columns for every line item — rematerialize via
`pricingFromBooking`.

| Engine field      | DB column          | Persist? | Reason                                |
| ----------------- | ------------------ | -------- | ------------------------------------- |
| dailyRate         | `daily_charge`     | Yes      | Rate locked at hire time              |
| kilometerRate     | `kilometer_rate`   | Yes      | Rate locked at hire time              |
| rentalDays        | `duration`         | Yes      | List / report snapshot                |
| totalKilometers   | `total_kilometers` | Yes      | Snapshot when odometers recorded      |
| amountPaid        | `booking_amount`   | Yes      | Advance / amount collected            |
| securityDeposit   | `caution_money`    | Yes      | Deposit (separate ledger concept)     |
| grandTotal        | `total_amount`     | Yes      | Invoice total snapshot                |
| rentalCharge etc. | —                  | No       | Always recalculated by Pricing Engine |
| remainingBalance  | —                  | No       | Derived: grand total − amount paid    |

### Column semantics (clarified in 6.5)

- `booking_amount` = **amount paid** toward the hire (advance), not the hire total.
- `total_amount` = **grand total** from the Pricing Engine.
- `caution_money` = security deposit.

Legacy rows that stored hire charges in both `booking_amount` and `total_amount`
read as fully paid (`remainingBalance ≈ 0`) when rates still match.

## Service API

```ts
import {
  calculatePricing,
  previewPricing,
  pricingFromBooking,
  pricingToPersistedFields,
  getPricingService,
} from '@/features/bookings/service/pricing.service';

// Strict (throws AppError on invalid input) — BookingService create / update
const summary = calculatePricing({ ... });

// Lenient live preview — Booking Form
const live = previewPricing({ dailyRate, deliveryDate, returnDate, ... });

// Detail / rematerialize from a booking row
const fromRow = pricingFromBooking(booking);
```

`PricingService` (`createPricingService` / `getPricingService`) wraps the same
pure helpers for DI-style callers.

## Validation

Engine rejects (friendly messages via `createBookingValidationError`):

- Negative daily / kilometer rates
- Negative odometer / amount paid / security deposit
- End odometer &lt; start odometer
- Invalid or inverted dates

Zod schemas in `@/validations/booking` remain the first gate on Server Actions;
the engine re-validates before math so future non-form callers stay safe.

## UI surfaces

| Surface         | Behavior                                                         |
| --------------- | ---------------------------------------------------------------- |
| Booking Form    | Calls `previewPricing` on input change; read-only derived fields |
| Pricing summary | `<BookingPricingSummary>` with `aria-live="polite"` on the form  |
| Booking Details | Calls `pricingFromBooking`; never recomputes formulas inline     |

Vehicle select seeds `daily_charge`, `kilometer_rate`, and `caution_money`
from vehicle defaults when creating a booking.

## Future extension

1. **Free kilometers** — pass `includedKilometers`; chargeable KM already uses
   `max(0, total − included)`.
2. **Discounts** — set `discountAmount` before GST.
3. **GST** — set `gstRate` (e.g. `0.18`); `gstAmount` and `grandTotal` update.
4. **Per-mode rate cards** — resolve rates in Booking Service, still call
   Pricing Engine with the resolved numbers.
5. **Payments ledger** — if amount paid becomes multi-payment, feed the sum
   into `amountPaid` without changing formulas.

## Feature files

```
src/features/bookings/
├── service/
│   ├── pricing.service.ts      ← Pricing Engine (source of truth)
│   ├── booking-service.ts      ← persists engine snapshots
│   └── booking-calculations.ts ← invoice helpers + legacy re-exports
└── components/
    └── booking-pricing-summary.tsx
```

## Related docs

- [Bookings data layer](./bookings-data-layer.md)
- [Create Booking UI](./bookings-create.md)
- [Edit Booking UI](./bookings-edit.md)
- [Booking Details](./bookings-details.md)
- [Database schema](./database.md)
- [Types & validation](./types-and-validation.md)
