# Invoice numbering

Phase 6.1 adds a production-grade, database-backed invoice number generator for
bookings. Numbers are allocated once during booking creation — never in React
components, never by reading the last booking row, and never in Server Actions.

## Format

```
{prefix}-{year}-{sequence}
```

Examples:

- `SC-2026-00001`
- `SC-2026-00002`
- `SC-2027-00001` (new year resets the sequence)

| Segment    | Source                                                 |
| ---------- | ------------------------------------------------------ |
| `prefix`   | Configurable company prefix (default `SC`)             |
| `year`     | UTC calendar year at allocation time                   |
| `sequence` | Zero-padded yearly counter (width from config = **5**) |

Existing bookings created before the sequence table (any zero-pad width) are
parsed and used as a floor so New Booking never reuses an already-taken number.

Future format changes should only require config / formatter updates.

## Architecture

```
Create booking (Booking Service)
  → InvoiceNumberService.generateNextInvoiceNumber()
      → RPC public.next_invoice_sequence(prefix, year)
          → INSERT … ON CONFLICT DO UPDATE (atomic increment)
      → formatInvoiceNumber()
  → BookingRepository.create({ …, invoice_number })
```

Rules:

1. Allocation lives only in `InvoiceNumberService`.
2. The booking service calls generate **once** per create.
3. Client-supplied invoice numbers are ignored on create and stripped on update.
4. `bookings.invoice_number` remains UNIQUE as a final safety net.

### Folder layout

```
src/config/invoice.ts                          # Prefix, padding, format helpers
src/features/bookings/service/
  invoice-number.service.ts                    # Generate / preview
  booking-service.ts                           # Integrates generation on create
supabase/migrations/
  20260728140000_create_invoice_sequences.sql  # Table + RPCs
```

## Database

### `public.invoice_sequences`

| Column             | Type          | Notes                          |
| ------------------ | ------------- | ------------------------------ |
| `id`               | `uuid` PK     | `gen_random_uuid()`            |
| `prefix`           | `text`        | Uppercase company prefix       |
| `year`             | `integer`     | UTC year bucket (2000–2100)    |
| `current_sequence` | `integer`     | Last allocated value (≥ 0)     |
| `created_at`       | `timestamptz` | UTC                            |
| `updated_at`       | `timestamptz` | Maintained by `set_updated_at` |

Unique constraint: `(prefix, year)`.

### RPCs

| Function                                     | Behavior                                                             |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `max_booking_invoice_sequence(prefix, year)` | Highest sequence already on `bookings` for that prefix/year          |
| `next_invoice_sequence(prefix, year)`        | Atomically allocates next value floored by existing bookings         |
| `peek_next_invoice_sequence(prefix, year)`   | Returns next value **without** incrementing (includes booking floor) |

Both allocate/peek RPCs are `SECURITY DEFINER` so authenticated staff can
allocate without direct table writes. RLS allows staff `SELECT` only; mutations
go through the RPC.

Migration `20260728150000_sync_invoice_sequences_from_bookings.sql` seeds
`invoice_sequences` from existing `bookings.invoice_number` rows and keeps peek /
next floored by that max going forward.

## Concurrency strategy

`next_invoice_sequence` uses a single-statement upsert:

```sql
INSERT INTO invoice_sequences (prefix, year, current_sequence)
VALUES ($prefix, $year, 1)
ON CONFLICT (prefix, year)
DO UPDATE SET current_sequence = invoice_sequences.current_sequence + 1
RETURNING current_sequence;
```

PostgreSQL locks the conflicting row during the upsert, so two concurrent
booking creates never receive the same sequence. Gaps are allowed if a later
insert fails after allocation — invoice numbers are never reused.

## Generation lifecycle

1. Staff opens `/bookings/new`.
2. Server peeks the next number (`previewNextInvoiceNumber`) for read-only form display.
3. On save, `createBooking` → booking service → `generateNextInvoiceNumber` (allocates once).
4. Booking row is inserted with the allocated invoice number.
5. Success toast / list / detail show the final invoice.

Edit flows keep the existing invoice read-only; updates never change it.

## Configuration

| Setting                 | Location                        | Default |
| ----------------------- | ------------------------------- | ------- |
| Company prefix          | `INVOICE_COMPANY_PREFIX` env    | `SC`    |
| Sequence zero-pad width | `invoiceConfig.sequencePadding` | `5`     |

```ts
import { invoiceConfig, formatInvoiceNumber, resolveInvoicePrefix } from '@/config';
```

Company settings can later override the prefix by injecting
`createInvoiceNumberService({ prefix })` into the booking service deps.

## Error handling

| Code                        | User-facing message                                         |
| --------------------------- | ----------------------------------------------------------- |
| `invoice_generation_failed` | Unable to generate an invoice number. Please try again.     |
| `duplicate_invoice`         | A booking with this invoice number already exists.          |
| `database_failure`          | Unable to complete the booking operation. Please try again. |

Internal Postgres / PostgREST details are never returned to the UI.

## Future extension points

1. **Company settings UI** — persist prefix per tenant; pass into service deps.
2. **Multi-branch prefixes** — additional rows keyed by `(prefix, year)`.
3. **Fiscal-year buckets** — change `resolveInvoiceYear` without touching SQL.
4. **Wider padding** — bump `invoiceConfig.sequencePadding` (formatter only).
5. **Transactional unit-of-work** — share one Supabase client across invoice RPC + booking insert when true multi-statement transactions are available.

## Related docs

- [Bookings data layer](./bookings-data-layer.md)
- [Create Booking UI](./bookings-create.md)
- [Database schema](./database.md)
- [Shared architecture](./architecture.md)
