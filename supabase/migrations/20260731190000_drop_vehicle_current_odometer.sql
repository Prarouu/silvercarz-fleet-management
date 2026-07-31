-- =============================================================================
-- Drop unused vehicles.current_odometer column
-- =============================================================================

ALTER TABLE public.vehicles
  DROP CONSTRAINT IF EXISTS vehicles_current_odometer_non_negative;

ALTER TABLE public.vehicles
  DROP COLUMN IF EXISTS current_odometer;
