-- =============================================================================
-- Allow customers to read vehicles linked to their own booking history
-- =============================================================================
-- Public fleet read only covers active vehicles. Customers still need to see
-- the car on My Bookings after a request is confirmed, denied, or when the
-- vehicle later becomes inactive.
-- =============================================================================

DROP POLICY IF EXISTS vehicles_select_own_booking_history ON public.vehicles;
CREATE POLICY vehicles_select_own_booking_history
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bookings AS b
      WHERE b.vehicle_id = vehicles.id
        AND b.created_by = auth.uid()
    )
  );

COMMENT ON POLICY vehicles_select_own_booking_history ON public.vehicles IS
  'Customers may read vehicles referenced by their own booking requests (history).';
