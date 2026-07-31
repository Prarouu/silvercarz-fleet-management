-- =============================================================================
-- Booking schedule range index — calendar / dashboard / lifecycle reads
-- =============================================================================
-- Conflict Detection already has a confirmed/ongoing partial index.
-- Calendar, dashboard, and availability lifecycle reads also include completed
-- (and sometimes draft/cancelled exclusion via neq). Restore a broader
-- vehicle + date index for those schedule scans.
-- =============================================================================

CREATE INDEX IF NOT EXISTS bookings_vehicle_schedule_dates_idx
  ON public.bookings (vehicle_id, delivery_date, return_date)
  WHERE status IN (
    'confirmed'::public.booking_status,
    'ongoing'::public.booking_status,
    'completed'::public.booking_status
  );

COMMENT ON INDEX public.bookings_vehicle_schedule_dates_idx IS
  'Supports calendar, dashboard, and Availability Engine lifecycle schedule scans.';
