-- =============================================================================
-- Vehicles: add transmission_type; drop unused rate / deposit columns
-- =============================================================================
-- Indian-market transmission options:
--   manual, automatic, amt, cvt, dct
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE public.transmission_type AS ENUM (
    'manual',
    'automatic',
    'amt',
    'cvt',
    'dct'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.transmission_type IS
  'Vehicle gearbox type common in the Indian passenger-car market.';

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS transmission_type public.transmission_type;

-- Backfill existing rows before enforcing NOT NULL.
UPDATE public.vehicles
SET transmission_type = 'manual'::public.transmission_type
WHERE transmission_type IS NULL;

ALTER TABLE public.vehicles
  ALTER COLUMN transmission_type SET NOT NULL,
  ALTER COLUMN transmission_type SET DEFAULT 'manual'::public.transmission_type;

CREATE INDEX IF NOT EXISTS vehicles_transmission_type_idx
  ON public.vehicles (transmission_type);

COMMENT ON COLUMN public.vehicles.transmission_type IS
  'Gearbox type: manual, automatic, AMT, CVT, or DCT.';

ALTER TABLE public.vehicles
  DROP CONSTRAINT IF EXISTS vehicles_extra_kilometer_rate_non_negative,
  DROP CONSTRAINT IF EXISTS vehicles_security_deposit_non_negative;

ALTER TABLE public.vehicles
  DROP COLUMN IF EXISTS extra_kilometer_rate,
  DROP COLUMN IF EXISTS security_deposit;
