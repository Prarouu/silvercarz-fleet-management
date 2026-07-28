-- =============================================================================
-- Extend vehicle_availability with reserved + inactive
-- =============================================================================
-- Phase 6.2 — Vehicle Availability Engine.
-- Adds lifecycle states used by the centralized availability service.
-- Safe to re-run: ADD VALUE IF NOT EXISTS (Postgres 9.1+ / Supabase).
-- =============================================================================

ALTER TYPE public.vehicle_availability ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE public.vehicle_availability ADD VALUE IF NOT EXISTS 'inactive';

COMMENT ON TYPE public.vehicle_availability IS
  'Operational availability: available | booked | reserved | maintenance | inactive. '
  'Distinct from vehicles.is_active (fleet roster). Soft-retire should set inactive.';

COMMENT ON COLUMN public.vehicles.availability_status IS
  'Operational availability managed by the Availability Engine. '
  'available = bookable; reserved = future hire; booked = active hire; '
  'maintenance = blocked; inactive = removed from active fleet.';
