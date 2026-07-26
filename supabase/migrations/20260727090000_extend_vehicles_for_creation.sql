-- =============================================================================
-- Extend vehicles for Add Vehicle workflow (profile fields + image path)
-- =============================================================================
-- Adds brand / model / rates / odometer / availability / image_path columns and
-- a public Storage bucket for vehicle photos (upload gated in application code).
-- Depends on: public.vehicles, public.is_active_staff()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enum: vehicle_availability
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.vehicle_availability AS ENUM (
    'available',
    'booked',
    'maintenance'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.vehicle_availability IS
  'Operational availability of a fleet vehicle. Extend by adding values; do not rename existing.';

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS variant text,
  ADD COLUMN IF NOT EXISTS model_year integer,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS extra_kilometer_rate numeric(12, 2),
  ADD COLUMN IF NOT EXISTS security_deposit numeric(12, 2),
  ADD COLUMN IF NOT EXISTS current_odometer numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability_status public.vehicle_availability NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS image_path text;

-- Backfill required text columns for any pre-existing rows
UPDATE public.vehicles
SET
  brand = COALESCE(NULLIF(trim(brand), ''), 'Unknown'),
  model = COALESCE(NULLIF(trim(model), ''), 'Unknown')
WHERE brand IS NULL OR model IS NULL OR trim(brand) = '' OR trim(model) = '';

ALTER TABLE public.vehicles
  ALTER COLUMN brand SET NOT NULL,
  ALTER COLUMN model SET NOT NULL;

-- Constraints (idempotent via named drops)
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_brand_not_blank;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_brand_not_blank CHECK (char_length(trim(brand)) > 0);

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_model_not_blank;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_model_not_blank CHECK (char_length(trim(model)) > 0);

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_model_year_range;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_model_year_range CHECK (
    model_year IS NULL OR (model_year >= 1980 AND model_year <= 2100)
  );

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_extra_kilometer_rate_non_negative;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_extra_kilometer_rate_non_negative CHECK (
    extra_kilometer_rate IS NULL OR extra_kilometer_rate >= 0
  );

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_security_deposit_non_negative;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_security_deposit_non_negative CHECK (
    security_deposit IS NULL OR security_deposit >= 0
  );

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_current_odometer_non_negative;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_current_odometer_non_negative CHECK (current_odometer >= 0);

ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_image_path_not_blank;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_image_path_not_blank CHECK (
    image_path IS NULL OR char_length(trim(image_path)) > 0
  );

COMMENT ON COLUMN public.vehicles.brand IS 'Manufacturer / brand name.';
COMMENT ON COLUMN public.vehicles.model IS 'Model name.';
COMMENT ON COLUMN public.vehicles.variant IS 'Optional trim / variant.';
COMMENT ON COLUMN public.vehicles.model_year IS 'Optional model year (calendar year).';
COMMENT ON COLUMN public.vehicles.color IS 'Optional exterior color.';
COMMENT ON COLUMN public.vehicles.extra_kilometer_rate IS 'Optional INR rate per extra kilometer.';
COMMENT ON COLUMN public.vehicles.security_deposit IS 'Optional default security deposit (INR).';
COMMENT ON COLUMN public.vehicles.current_odometer IS 'Current odometer reading (km).';
COMMENT ON COLUMN public.vehicles.availability_status IS
  'Operational availability. Distinct from is_active (fleet roster status).';
COMMENT ON COLUMN public.vehicles.image_path IS
  'Supabase Storage object path within the vehicle-images bucket (not a full URL).';

CREATE INDEX IF NOT EXISTS vehicles_availability_status_idx
  ON public.vehicles (availability_status);

CREATE INDEX IF NOT EXISTS vehicles_brand_idx
  ON public.vehicles (brand);

-- ---------------------------------------------------------------------------
-- Storage bucket: vehicle-images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "vehicle_images_select_staff" ON storage.objects;
CREATE POLICY "vehicle_images_select_staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND public.is_active_staff()
  );

DROP POLICY IF EXISTS "vehicle_images_insert_staff" ON storage.objects;
CREATE POLICY "vehicle_images_insert_staff"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND public.is_active_staff()
  );

DROP POLICY IF EXISTS "vehicle_images_update_staff" ON storage.objects;
CREATE POLICY "vehicle_images_update_staff"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND public.is_active_staff()
  )
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND public.is_active_staff()
  );

DROP POLICY IF EXISTS "vehicle_images_delete_staff" ON storage.objects;
CREATE POLICY "vehicle_images_delete_staff"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND public.is_active_staff()
  );

-- Public read for public bucket URLs (anon can fetch when using public URL).
DROP POLICY IF EXISTS "vehicle_images_select_public" ON storage.objects;
CREATE POLICY "vehicle_images_select_public"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'vehicle-images');
