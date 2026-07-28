-- =============================================================================
-- Booking conflict detection — refine overlap index for blocking statuses
-- =============================================================================
-- Conflict Detection Engine only treats confirmed / ongoing as blocking.
-- Replace the broader non-cancelled partial index with a tighter one that
-- matches those statuses for vehicle + date-window lookups.
-- =============================================================================

DROP INDEX IF EXISTS public.bookings_vehicle_active_dates_idx;

CREATE INDEX IF NOT EXISTS bookings_vehicle_conflict_dates_idx
  ON public.bookings (vehicle_id, delivery_date, return_date)
  WHERE status IN (
    'confirmed'::public.booking_status,
    'ongoing'::public.booking_status
  );

COMMENT ON INDEX public.bookings_vehicle_conflict_dates_idx IS
  'Supports Conflict Detection Engine overlap queries (confirmed / ongoing only).';
