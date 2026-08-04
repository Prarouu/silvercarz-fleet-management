-- =============================================================================
-- Customer booking request RLS + conflict helper (C3)
-- =============================================================================
-- Customers submit booking REQUESTS into the existing `bookings` table with
-- status = 'draft' (Pending Approval). Admin continues to approve via the
-- existing draft filter at /admin/bookings?status=draft.
--
-- Changes:
-- 1. Customers may SELECT their own bookings (created_by = auth.uid()).
-- 2. Customers may INSERT only their own draft requests with safe defaults.
-- 3. Customers may NOT UPDATE or DELETE bookings (no self-approval / payment).
-- 4. SECURITY DEFINER helper so Conflict Engine can read blocking windows
--    under a customer JWT (staff policies alone would hide overlaps).
--
-- Preserves: staff policies, draft non-blocking semantics, invoice sequences,
-- existing booking rows, Availability / Pricing / Status engines.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Conflict windows visible to authenticated callers (schedule check only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_vehicle_booking_conflicts(
  p_vehicle_id uuid,
  p_delivery_date date,
  p_return_date date,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  vehicle_id uuid,
  status public.booking_status,
  delivery_date date,
  return_date date,
  invoice_number text,
  customer_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_vehicle_id IS NULL THEN
    RAISE EXCEPTION 'Vehicle id is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_delivery_date IS NULL OR p_return_date IS NULL THEN
    RAISE EXCEPTION 'Delivery and return dates are required'
      USING ERRCODE = '22023';
  END IF;

  IF p_return_date < p_delivery_date THEN
    RAISE EXCEPTION 'Return date must be on or after the delivery date'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.vehicle_id,
    b.status,
    b.delivery_date,
    b.return_date,
    b.invoice_number,
    b.customer_name
  FROM public.bookings AS b
  WHERE b.vehicle_id = p_vehicle_id
    AND b.status IN (
      'confirmed'::public.booking_status,
      'ongoing'::public.booking_status
    )
    AND b.delivery_date <= p_return_date
    AND b.return_date >= p_delivery_date
    AND (p_exclude_booking_id IS NULL OR b.id <> p_exclude_booking_id)
  ORDER BY b.delivery_date ASC;
END;
$$;

COMMENT ON FUNCTION public.list_vehicle_booking_conflicts(uuid, date, date, uuid) IS
  'Returns schedule-blocking bookings overlapping a vehicle/date window. SECURITY DEFINER so Conflict Engine works for customer JWT callers.';

GRANT EXECUTE ON FUNCTION public.list_vehicle_booking_conflicts(uuid, date, date, uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_vehicle_booking_conflicts(uuid, date, date, uuid)
  TO service_role;

-- ---------------------------------------------------------------------------
-- Customer SELECT — own rows only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
CREATE POLICY bookings_select_own
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- Customer INSERT — own draft request only (server forces other fields)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS bookings_insert_own_draft ON public.bookings;
CREATE POLICY bookings_insert_own_draft
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'draft'::public.booking_status
    AND document_submitted = false
    AND booking_amount = 0
    AND payment_method IS NULL
  );
