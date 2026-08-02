-- =============================================================================
-- Add `customer` app_role for public portal accounts
-- =============================================================================
-- Why: Public signup must not create staff (`manager`) profiles. C0 left only
-- owner | manager; customer auth requires a distinct non-staff role.
--
-- Preserves: existing owner/manager rows, is_active_staff(), staff RLS,
-- protect_profile_privileged_columns, profiles table shape.
-- =============================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

COMMENT ON TYPE public.app_role IS
  'Application RBAC roles: owner | manager | customer. Add values; never rename.';

-- New rows without an explicit role are customers (staff must set app_metadata.role).
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'customer'::public.app_role;

-- ---------------------------------------------------------------------------
-- Auto-create profile: staff only when app_metadata.role is owner|manager
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role public.app_role;
  raw_role text;
BEGIN
  raw_role := NEW.raw_app_meta_data ->> 'role';

  IF raw_role IN ('owner', 'manager') THEN
    resolved_role := raw_role::public.app_role;
  ELSE
    resolved_role := 'customer'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    coalesce(NEW.email, ''),
    nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'full_name', '')), ''),
    resolved_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'SECURITY DEFINER trigger: creates a profiles row for every new auth.users row. Defaults to customer unless app_metadata.role is owner|manager.';

-- ---------------------------------------------------------------------------
-- Login safety net: same role resolution as handle_new_user
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_own_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
  result public.profiles;
  resolved_role public.app_role;
  raw_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO auth_user FROM auth.users WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auth user not found' USING ERRCODE = '28000';
  END IF;

  raw_role := auth_user.raw_app_meta_data ->> 'role';

  IF raw_role IN ('owner', 'manager') THEN
    resolved_role := raw_role::public.app_role;
  ELSE
    resolved_role := 'customer'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    auth_user.id,
    coalesce(auth_user.email, ''),
    nullif(trim(coalesce(auth_user.raw_user_meta_data ->> 'full_name', '')), ''),
    resolved_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email
  RETURNING * INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.ensure_own_profile() IS
  'SECURITY DEFINER: creates or returns the profile for auth.uid(). Defaults new rows to customer unless app_metadata.role is owner|manager.';
