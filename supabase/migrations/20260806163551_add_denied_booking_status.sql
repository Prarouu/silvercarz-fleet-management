-- =============================================================================
-- Add `denied` booking status for rejected customer requests
-- =============================================================================
-- Customer draft requests can be denied by staff. Denied is terminal (like
-- cancelled): it never occupies the vehicle calendar and is kept as historic
-- proof that a request was reviewed and rejected.
-- =============================================================================

ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'denied';

COMMENT ON TYPE public.booking_status IS
  'draft | confirmed | ongoing | completed | cancelled | denied';
