-- =============================================================================
-- Drop unused booking caution / security deposit column
-- =============================================================================

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_caution_money_non_negative;

ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS caution_money;
