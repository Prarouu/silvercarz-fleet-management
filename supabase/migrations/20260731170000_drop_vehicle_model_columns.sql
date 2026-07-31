-- =============================================================================
-- Drop unused vehicle model / variant / model_year columns
-- =============================================================================

ALTER TABLE public.vehicles
  DROP CONSTRAINT IF EXISTS vehicles_model_not_blank,
  DROP CONSTRAINT IF EXISTS vehicles_model_year_range;

ALTER TABLE public.vehicles
  DROP COLUMN IF EXISTS model,
  DROP COLUMN IF EXISTS variant,
  DROP COLUMN IF EXISTS model_year;
