-- =============================================================================
-- Profiles, roles, and Row Level Security
-- =============================================================================
-- Application user data lives in public.profiles (1:1 with auth.users).
-- Roles: owner | manager (both have full application access today).
-- Profile rows are created automatically via a trigger on auth.users insert.
-- Safe to re-run in the Supabase SQL Editor (idempotent where practical).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enum: application roles (extend by adding values; do not rename existing)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON TYPE public.app_role IS
  'Application RBAC roles. Add new values as the product grows; never rename.';

-- ---------------------------------------------------------------------------
-- Table: profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role public.app_role NOT NULL DEFAULT 'manager'::public.app_role,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_email_not_blank CHECK (char_length(trim(email)) > 0),
  CONSTRAINT profiles_full_name_not_blank CHECK (
    full_name IS NULL OR char_length(trim(full_name)) > 0
  )
);

COMMENT ON TABLE public.profiles IS
  'Application user profile linked 1:1 to auth.users. Source of truth for role and active status.';
COMMENT ON COLUMN public.profiles.id IS
  'Same UUID as auth.users.id.';
COMMENT ON COLUMN public.profiles.role IS
  'RBAC role used by application authorization helpers and future RLS.';
COMMENT ON COLUMN public.profiles.is_active IS
  'When false, the user may authenticate but must be denied application access.';

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON public.profiles (is_active);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Protect privileged columns from client updates (id, role, is_active).
-- Email may change via handle_user_email_updated (auth sync). Role / active
-- status are changed only with the service role (Dashboard / admin SQL).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_role text := auth.role();
BEGIN
  -- Authenticated clients (PostgREST / app) cannot escalate privileges.
  IF jwt_role = 'authenticated' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'Cannot modify privileged profile fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileged_columns ON public.profiles;
CREATE TRIGGER profiles_protect_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- ---------------------------------------------------------------------------
-- Auto-create profile when an auth user is created
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
    resolved_role := 'manager'::public.app_role;
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
  'SECURITY DEFINER trigger: creates a profiles row for every new auth.users row.';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing auth users (idempotent)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  coalesce(u.email, ''),
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), ''),
  CASE
    WHEN u.raw_app_meta_data ->> 'role' IN ('owner', 'manager')
      THEN (u.raw_app_meta_data ->> 'role')::public.app_role
    ELSE 'manager'::public.app_role
  END
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

-- Keep email in sync when auth.users.email changes
CREATE OR REPLACE FUNCTION public.handle_user_email_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = coalesce(NEW.email, '')
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_updated();

-- ---------------------------------------------------------------------------
-- Helper: current user's role (SECURITY DEFINER — avoids RLS recursion)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
    AND is_active = true
$$;

COMMENT ON FUNCTION public.current_user_role() IS
  'Returns the active role for auth.uid(). Used by RLS policies; never trust the client for role.';

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ---------------------------------------------------------------------------
-- Ensure a profile exists for the current JWT user (Auth Dashboard safety net)
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
    resolved_role := 'manager'::public.app_role;
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
  'SECURITY DEFINER: creates or returns the profile for auth.uid(). Used after login.';

GRANT EXECUTE ON FUNCTION public.ensure_own_profile() TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_select_staff ON public.profiles;
CREATE POLICY profiles_select_staff
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('owner'::public.app_role, 'manager'::public.app_role));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT / DELETE policies for authenticated clients.
-- Inserts are performed by handle_new_user() / ensure_own_profile() (SECURITY DEFINER).
-- Deletes cascade from auth.users; admin role changes use the service role.

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
