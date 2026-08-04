-- =============================================================================
-- 20260802160000 — Add `customer` to app_role (enum value only)
-- =============================================================================
-- Apply order: after 20260802140000_vehicles_public_read.sql
-- Next:         20260805040000_customer_booking_request_rls.sql
--
-- IMPORTANT:
--   This file must contain ONLY the enum ADD VALUE (+ type comment).
--   Postgres requires the new value to be committed before it can be used.
--   Do not add DEFAULT / CAST / function bodies that reference `customer` here.
--
-- Role usage (defaults, signup triggers, staff allowlist) lives in:
--   20260805120000_staff_allowlist_default_customer.sql
-- =============================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

COMMENT ON TYPE public.app_role IS
  'Application RBAC roles: owner | manager | customer. Add values; never rename.';
