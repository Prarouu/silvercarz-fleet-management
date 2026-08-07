-- =============================================================================
-- 20260805140000 — Customer booking documents (C4)
-- =============================================================================
-- Apply order: after 20260805120000_staff_allowlist_default_customer.sql
--
-- Private identity documents attached to customer booking REQUESTS (status draft).
-- Files live in a PRIVATE Storage bucket; only metadata is stored in Postgres.
--
-- Changes:
-- 1. booking_documents table + RLS (owner customer + staff)
-- 2. Private `booking-documents` Storage bucket + path-scoped policies
-- 3. SECURITY DEFINER helper to flip bookings.document_submitted safely
--
-- Does NOT: approve bookings, change status beyond draft, expose public URLs,
-- or grant customers broad UPDATE on bookings.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table: booking_documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT booking_documents_type_not_blank CHECK (char_length(trim(document_type)) > 0),
  CONSTRAINT booking_documents_file_name_not_blank CHECK (char_length(trim(file_name)) > 0),
  CONSTRAINT booking_documents_storage_path_not_blank CHECK (char_length(trim(storage_path)) > 0),
  CONSTRAINT booking_documents_mime_type_not_blank CHECK (char_length(trim(mime_type)) > 0),
  CONSTRAINT booking_documents_file_size_positive CHECK (file_size > 0),
  CONSTRAINT booking_documents_type_allowed CHECK (
    document_type IN ('driving_license', 'government_id', 'address_proof')
  ),
  CONSTRAINT booking_documents_mime_allowed CHECK (
    mime_type IN ('application/pdf', 'image/jpeg', 'image/png')
  ),
  CONSTRAINT booking_documents_booking_type_unique UNIQUE (booking_id, document_type),
  CONSTRAINT booking_documents_storage_path_unique UNIQUE (storage_path)
);

COMMENT ON TABLE public.booking_documents IS
  'Metadata for private customer identity documents linked to a booking request. Binary files live in Storage.';
COMMENT ON COLUMN public.booking_documents.customer_id IS
  'Owning customer (profiles.id). Must match bookings.created_by for the booking.';
COMMENT ON COLUMN public.booking_documents.storage_path IS
  'Object path within the private booking-documents bucket (not a URL).';
COMMENT ON COLUMN public.booking_documents.document_type IS
  'Canonical type: driving_license | government_id | address_proof.';

CREATE INDEX IF NOT EXISTS booking_documents_booking_id_idx
  ON public.booking_documents (booking_id);
CREATE INDEX IF NOT EXISTS booking_documents_customer_id_idx
  ON public.booking_documents (customer_id);

DROP TRIGGER IF EXISTS booking_documents_set_updated_at ON public.booking_documents;
CREATE TRIGGER booking_documents_set_updated_at
  BEFORE UPDATE ON public.booking_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Ownership integrity — customer_id must match booking owner
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_booking_document_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  booking_owner uuid;
BEGIN
  SELECT b.created_by INTO booking_owner
  FROM public.bookings AS b
  WHERE b.id = NEW.booking_id;

  IF booking_owner IS NULL THEN
    RAISE EXCEPTION 'Booking not found for document'
      USING ERRCODE = '23503';
  END IF;

  IF NEW.customer_id IS DISTINCT FROM booking_owner THEN
    RAISE EXCEPTION 'Document customer must match booking owner'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_booking_document_owner() IS
  'Ensures booking_documents.customer_id always matches bookings.created_by.';

DROP TRIGGER IF EXISTS booking_documents_enforce_owner ON public.booking_documents;
CREATE TRIGGER booking_documents_enforce_owner
  BEFORE INSERT OR UPDATE OF booking_id, customer_id ON public.booking_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_booking_document_owner();

-- ---------------------------------------------------------------------------
-- Mark documents submitted (narrow write — customers cannot UPDATE bookings)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_booking_documents_submitted(p_booking_id uuid)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.bookings;
  required_count integer := 3;
  uploaded_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking id is required'
      USING ERRCODE = '22023';
  END IF;

  SELECT b.* INTO row
  FROM public.bookings AS b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF row.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF row.created_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Booking not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF row.status IS DISTINCT FROM 'draft'::public.booking_status THEN
    RAISE EXCEPTION 'Documents can only be submitted for pending booking requests'
      USING ERRCODE = '23514';
  END IF;

  IF row.document_submitted IS TRUE THEN
    RETURN row;
  END IF;

  SELECT count(*)::integer INTO uploaded_count
  FROM public.booking_documents AS d
  WHERE d.booking_id = p_booking_id
    AND d.customer_id = auth.uid()
    AND d.document_type IN ('driving_license', 'government_id', 'address_proof');

  IF uploaded_count < required_count THEN
    RAISE EXCEPTION 'Please upload all required documents before continuing.'
      USING ERRCODE = '23514';
  END IF;

  UPDATE public.bookings AS b
  SET document_submitted = true
  WHERE b.id = p_booking_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

COMMENT ON FUNCTION public.mark_booking_documents_submitted(uuid) IS
  'Customer-only helper: verifies ownership + required docs, sets document_submitted without broad booking UPDATE.';

GRANT EXECUTE ON FUNCTION public.mark_booking_documents_submitted(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_booking_documents_submitted(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- RLS: booking_documents
-- ---------------------------------------------------------------------------
ALTER TABLE public.booking_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_documents_select_own ON public.booking_documents;
CREATE POLICY booking_documents_select_own
  ON public.booking_documents
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS booking_documents_select_staff ON public.booking_documents;
CREATE POLICY booking_documents_select_staff
  ON public.booking_documents
  FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

DROP POLICY IF EXISTS booking_documents_insert_own ON public.booking_documents;
CREATE POLICY booking_documents_insert_own
  ON public.booking_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.bookings AS b
      WHERE b.id = booking_id
        AND b.created_by = auth.uid()
        AND b.status = 'draft'::public.booking_status
        AND b.document_submitted = false
    )
  );

DROP POLICY IF EXISTS booking_documents_update_own ON public.booking_documents;
CREATE POLICY booking_documents_update_own
  ON public.booking_documents
  FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.bookings AS b
      WHERE b.id = booking_id
        AND b.created_by = auth.uid()
        AND b.status = 'draft'::public.booking_status
        AND b.document_submitted = false
    )
  )
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.bookings AS b
      WHERE b.id = booking_id
        AND b.created_by = auth.uid()
        AND b.status = 'draft'::public.booking_status
        AND b.document_submitted = false
    )
  );

DROP POLICY IF EXISTS booking_documents_delete_own ON public.booking_documents;
CREATE POLICY booking_documents_delete_own
  ON public.booking_documents
  FOR DELETE
  TO authenticated
  USING (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.bookings AS b
      WHERE b.id = booking_id
        AND b.created_by = auth.uid()
        AND b.status = 'draft'::public.booking_status
        AND b.document_submitted = false
    )
  );

DROP POLICY IF EXISTS booking_documents_staff_all ON public.booking_documents;
CREATE POLICY booking_documents_staff_all
  ON public.booking_documents
  FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_documents TO authenticated;
GRANT ALL ON public.booking_documents TO service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket: booking-documents (PRIVATE)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'booking-documents',
  'booking-documents',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: {customer_id}/{booking_id}/{document_type}-{uuid}.{ext}
-- First folder must equal auth.uid() for customers.

DROP POLICY IF EXISTS "booking_documents_storage_select_own" ON storage.objects;
CREATE POLICY "booking_documents_storage_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'booking-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "booking_documents_storage_select_staff" ON storage.objects;
CREATE POLICY "booking_documents_storage_select_staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'booking-documents'
    AND public.is_active_staff()
  );

DROP POLICY IF EXISTS "booking_documents_storage_insert_own" ON storage.objects;
CREATE POLICY "booking_documents_storage_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'booking-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "booking_documents_storage_update_own" ON storage.objects;
CREATE POLICY "booking_documents_storage_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'booking-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'booking-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "booking_documents_storage_delete_own" ON storage.objects;
CREATE POLICY "booking_documents_storage_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'booking-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "booking_documents_storage_delete_staff" ON storage.objects;
CREATE POLICY "booking_documents_storage_delete_staff"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'booking-documents'
    AND public.is_active_staff()
  );
