-- C1: Allow public (anon + authenticated) read of active fleet vehicles.
-- Additive alongside vehicles_select_staff — admin access unchanged.
-- Writes remain staff-only.

GRANT SELECT ON public.vehicles TO anon;

DROP POLICY IF EXISTS vehicles_select_public ON public.vehicles;
CREATE POLICY vehicles_select_public
  ON public.vehicles
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
