-- =============================================================================
-- Drop unused booking odometer / kilometer pricing columns
-- =============================================================================
-- Hire pricing is daily-rate only. Odometer readings and km charges are no
-- longer captured on bookings.
-- =============================================================================

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_kilometer_rate_non_negative,
  DROP CONSTRAINT IF EXISTS bookings_start_odometer_non_negative,
  DROP CONSTRAINT IF EXISTS bookings_end_odometer_non_negative,
  DROP CONSTRAINT IF EXISTS bookings_total_kilometers_non_negative,
  DROP CONSTRAINT IF EXISTS bookings_odometer_order;

ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS start_odometer,
  DROP COLUMN IF EXISTS end_odometer,
  DROP COLUMN IF EXISTS total_kilometers,
  DROP COLUMN IF EXISTS kilometer_rate;
