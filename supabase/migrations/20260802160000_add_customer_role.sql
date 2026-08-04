-- =============================================================================
-- Add `customer` to app_role enum (enum value only)
-- =============================================================================
-- Postgres requires a new enum value to be committed before it can be used.
-- Do not put DEFAULT / CAST / function bodies that reference `customer` here.
--
-- Next migration: 20260802161000_customer_role_profile_defaults.sql
-- =============================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

COMMENT ON TYPE public.app_role IS
  'Application RBAC roles: owner | manager | customer. Add values; never rename.';
