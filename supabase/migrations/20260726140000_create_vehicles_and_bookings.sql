-- =============================================================================
-- Vehicles, bookings, enums, constraints, indexes, and RLS
-- =============================================================================
-- Business tables for the Silver Carz fleet MVP.
-- Depends on: public.profiles, public.set_updated_at(), public.current_user_role()
-- Safe to re-run in the Supabase SQL Editor (idempotent where practical).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.fuel_type AS ENUM (
    'petrol',
    'diesel',
    'cng',
    'electric',
    'hybrid'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.fuel_type IS
  'Vehicle fuel category. Extend by adding values; do not rename existing.';

DO $$
BEGIN
  CREATE TYPE public.rental_mode AS ENUM (
    'with_driver',
    'without_driver'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.rental_mode IS
  'Whether the rental includes a company driver.';

DO $$
BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'upi',
    'card',
    'bank_transfer',
    'cheque',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.payment_method IS
  'How the customer settled (or will settle) the booking.';

DO $$
BEGIN
  CREATE TYPE public.booking_status AS ENUM (
    'draft',
    'confirmed',
    'ongoing',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.booking_status IS
  'Lifecycle status of a rental booking.';

-- ---------------------------------------------------------------------------
-- Helper: active internal staff (owner | manager)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() IN (
    'owner'::public.app_role,
    'manager'::public.app_role
  );
$$;

COMMENT ON FUNCTION public.is_active_staff() IS
  'True when auth.uid() is an active owner or manager. Used by RLS on business tables.';

GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

-- ---------------------------------------------------------------------------
-- Table: vehicles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_name text NOT NULL,
  vehicle_number text NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  default_daily_rate numeric(12, 2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT vehicles_vehicle_name_not_blank CHECK (char_length(trim(vehicle_name)) > 0),
  CONSTRAINT vehicles_vehicle_number_not_blank CHECK (char_length(trim(vehicle_number)) > 0),
  CONSTRAINT vehicles_vehicle_number_unique UNIQUE (vehicle_number),
  CONSTRAINT vehicles_default_daily_rate_non_negative CHECK (default_daily_rate >= 0)
);

COMMENT ON TABLE public.vehicles IS
  'Fleet vehicles available for rental. Source of truth for registration number and default rate.';
COMMENT ON COLUMN public.vehicles.vehicle_number IS
  'Unique registration / plate number (store normalized uppercase in application code).';
COMMENT ON COLUMN public.vehicles.default_daily_rate IS
  'Default daily hire charge in INR; bookings may override via daily_charge.';
COMMENT ON COLUMN public.vehicles.is_active IS
  'When false, vehicle remains for history but should not be offered for new bookings.';

-- vehicle_number unique constraint already provides a btree index
CREATE INDEX IF NOT EXISTS vehicles_is_active_idx ON public.vehicles (is_active);
CREATE INDEX IF NOT EXISTS vehicles_fuel_type_idx ON public.vehicles (fuel_type);
CREATE INDEX IF NOT EXISTS vehicles_vehicle_name_idx ON public.vehicles (vehicle_name);

DROP TRIGGER IF EXISTS vehicles_set_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_set_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  vehicle_id uuid NOT NULL,
  mode public.rental_mode NOT NULL,
  customer_name text NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  place_to_visit text,
  document_submitted boolean NOT NULL DEFAULT false,
  contact_number text,
  invoice_date date NOT NULL DEFAULT (timezone('utc', now()))::date,
  delivery_date date NOT NULL,
  return_date date NOT NULL,
  driver_name text,
  daily_charge numeric(12, 2) NOT NULL,
  fuel_range text,
  start_odometer numeric(12, 2),
  end_odometer numeric(12, 2),
  total_kilometers numeric(12, 2),
  duration numeric(8, 2),
  kilometer_rate numeric(12, 2),
  booking_amount numeric(12, 2) NOT NULL DEFAULT 0,
  caution_money numeric(12, 2) NOT NULL DEFAULT 0,
  payment_method public.payment_method,
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'confirmed'::public.booking_status,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT bookings_invoice_number_not_blank CHECK (char_length(trim(invoice_number)) > 0),
  CONSTRAINT bookings_invoice_number_unique UNIQUE (invoice_number),
  CONSTRAINT bookings_customer_name_not_blank CHECK (char_length(trim(customer_name)) > 0),
  CONSTRAINT bookings_contact_number_not_blank CHECK (
    contact_number IS NULL OR char_length(trim(contact_number)) > 0
  ),
  CONSTRAINT bookings_driver_name_not_blank CHECK (
    driver_name IS NULL OR char_length(trim(driver_name)) > 0
  ),
  CONSTRAINT bookings_return_after_delivery CHECK (return_date >= delivery_date),
  CONSTRAINT bookings_daily_charge_non_negative CHECK (daily_charge >= 0),
  CONSTRAINT bookings_booking_amount_non_negative CHECK (booking_amount >= 0),
  CONSTRAINT bookings_caution_money_non_negative CHECK (caution_money >= 0),
  CONSTRAINT bookings_total_amount_non_negative CHECK (total_amount >= 0),
  CONSTRAINT bookings_kilometer_rate_non_negative CHECK (
    kilometer_rate IS NULL OR kilometer_rate >= 0
  ),
  CONSTRAINT bookings_duration_positive CHECK (duration IS NULL OR duration > 0),
  CONSTRAINT bookings_start_odometer_non_negative CHECK (
    start_odometer IS NULL OR start_odometer >= 0
  ),
  CONSTRAINT bookings_end_odometer_non_negative CHECK (
    end_odometer IS NULL OR end_odometer >= 0
  ),
  CONSTRAINT bookings_total_kilometers_non_negative CHECK (
    total_kilometers IS NULL OR total_kilometers >= 0
  ),
  CONSTRAINT bookings_odometer_order CHECK (
    start_odometer IS NULL
    OR end_odometer IS NULL
    OR end_odometer >= start_odometer
  ),
  CONSTRAINT bookings_vehicle_id_fkey
    FOREIGN KEY (vehicle_id)
    REFERENCES public.vehicles (id)
    ON DELETE RESTRICT,
  CONSTRAINT bookings_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.profiles (id)
    ON DELETE SET NULL
);

COMMENT ON TABLE public.bookings IS
  'Rental bookings / invoices. Each row is one hire of a vehicle for a customer.';
COMMENT ON COLUMN public.bookings.invoice_number IS
  'Unique human-facing invoice / booking reference.';
COMMENT ON COLUMN public.bookings.mode IS
  'with_driver or without_driver rental mode.';
COMMENT ON COLUMN public.bookings.duration IS
  'Rental length in days (fractional days allowed).';
COMMENT ON COLUMN public.bookings.fuel_range IS
  'Fuel condition note (e.g. Full to Full), free text for MVP.';
COMMENT ON COLUMN public.bookings.created_by IS
  'Staff profile that created the booking; set from auth.uid() when omitted.';
COMMENT ON COLUMN public.bookings.status IS
  'draft → confirmed → ongoing → completed; or cancelled.';

-- Lookup / filter indexes (invoice_number unique constraint provides its index)
CREATE INDEX IF NOT EXISTS bookings_vehicle_id_idx ON public.bookings (vehicle_id);
CREATE INDEX IF NOT EXISTS bookings_delivery_date_idx ON public.bookings (delivery_date);
CREATE INDEX IF NOT EXISTS bookings_return_date_idx ON public.bookings (return_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_invoice_date_idx ON public.bookings (invoice_date);
CREATE INDEX IF NOT EXISTS bookings_created_by_idx ON public.bookings (created_by);
CREATE INDEX IF NOT EXISTS bookings_payment_method_idx ON public.bookings (payment_method);
CREATE INDEX IF NOT EXISTS bookings_mode_idx ON public.bookings (mode);
CREATE INDEX IF NOT EXISTS bookings_customer_name_idx ON public.bookings (customer_name);

-- Availability / calendar queries: active hires per vehicle in a date window
CREATE INDEX IF NOT EXISTS bookings_vehicle_active_dates_idx
  ON public.bookings (vehicle_id, delivery_date, return_date)
  WHERE status <> 'cancelled'::public.booking_status;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Default created_by to the inserting staff user when omitted
CREATE OR REPLACE FUNCTION public.set_booking_created_by()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_booking_created_by() IS
  'Sets bookings.created_by to auth.uid() when the client omits it.';

DROP TRIGGER IF EXISTS bookings_set_created_by ON public.bookings;
CREATE TRIGGER bookings_set_created_by
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_created_by();

-- Authenticated clients cannot reassign created_by after insert
CREATE OR REPLACE FUNCTION public.protect_booking_created_by()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_role text := auth.role();
BEGIN
  IF jwt_role = 'authenticated'
     AND NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Cannot modify bookings.created_by'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_protect_created_by ON public.bookings;
CREATE TRIGGER bookings_protect_created_by
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_booking_created_by();

-- ---------------------------------------------------------------------------
-- Row Level Security — internal staff (owner | manager) full access
-- ---------------------------------------------------------------------------
-- Policy documentation:
--
-- vehicles_select_staff  | SELECT | Active owner/manager may read all vehicles
-- vehicles_insert_staff  | INSERT | Active owner/manager may create vehicles
-- vehicles_update_staff  | UPDATE | Active owner/manager may update vehicles
-- vehicles_delete_staff  | DELETE | Active owner/manager may delete vehicles
--                         (FK RESTRICT blocks delete when bookings reference it)
--
-- bookings_select_staff  | SELECT | Active owner/manager may read all bookings
-- bookings_insert_staff  | INSERT | Active owner/manager may create bookings
-- bookings_update_staff  | UPDATE | Active owner/manager may update bookings
-- bookings_delete_staff  | DELETE | Active owner/manager may delete bookings
--
-- Anonymous / public roles have no policies → no access.
-- service_role bypasses RLS for trusted admin / seed scripts.
-- ---------------------------------------------------------------------------

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vehicles_select_staff ON public.vehicles;
CREATE POLICY vehicles_select_staff
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

DROP POLICY IF EXISTS vehicles_insert_staff ON public.vehicles;
CREATE POLICY vehicles_insert_staff
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS vehicles_update_staff ON public.vehicles;
CREATE POLICY vehicles_update_staff
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS vehicles_delete_staff ON public.vehicles;
CREATE POLICY vehicles_delete_staff
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (public.is_active_staff());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_select_staff ON public.bookings;
CREATE POLICY bookings_select_staff
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

DROP POLICY IF EXISTS bookings_insert_staff ON public.bookings;
CREATE POLICY bookings_insert_staff
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS bookings_update_staff ON public.bookings;
CREATE POLICY bookings_update_staff
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS bookings_delete_staff ON public.bookings;
CREATE POLICY bookings_delete_staff
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.is_active_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
