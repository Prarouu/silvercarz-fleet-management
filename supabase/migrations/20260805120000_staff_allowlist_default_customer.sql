-- =============================================================================
-- Staff allowlist — default public signups to customer
-- =============================================================================
-- Problem:
--   Legacy handle_new_user / ensure_own_profile defaulted missing roles to
--   `manager`, so public portal signups became Admin Portal staff.
--
-- Solution:
--   1. staff_allowlist is the only source of owner/manager assignment at signup.
--   2. Everyone else is always created as `customer`.
--   3. app_metadata.role is ignored for elevation (not trustable for public auth).
--   4. Bootstrap keeps up to 2 earliest existing staff emails on the allowlist,
--      then demotes every other accidental manager/owner to customer.
--
-- Adding a new admin later (SQL editor / service_role):
--   INSERT INTO public.staff_allowlist (email, role)
--   VALUES ('admin@example.com', 'owner')
--   ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;
--
--   UPDATE public.profiles
--   SET role = 'owner'
--   WHERE lower(email) = lower('admin@example.com');
--
--   SELECT public.apply_staff_allowlist();
-- =============================================================================

-- Ensure customer enum value exists (idempotent with prior migration).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'customer'::public.app_role;

-- ---------------------------------------------------------------------------
-- Allowlist table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_allowlist (
  email text PRIMARY KEY,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT staff_allowlist_role_check
    CHECK (role IN ('owner'::public.app_role, 'manager'::public.app_role)),
  CONSTRAINT staff_allowlist_email_check
    CHECK (char_length(trim(email)) > 2 AND position('@' IN email) > 1)
);

COMMENT ON TABLE public.staff_allowlist IS
  'Emails permitted to receive owner/manager profiles. Public signup is customer unless listed here.';

CREATE OR REPLACE FUNCTION public.normalize_staff_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(lower(trim(coalesce(p_email, ''))), '');
$$;

CREATE OR REPLACE FUNCTION public.staff_allowlist_normalize_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := public.normalize_staff_email(NEW.email);
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Staff allowlist email is required'
      USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_allowlist_normalize_email ON public.staff_allowlist;
CREATE TRIGGER staff_allowlist_normalize_email
  BEFORE INSERT OR UPDATE OF email ON public.staff_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION public.staff_allowlist_normalize_email();

ALTER TABLE public.staff_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_allowlist FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_allowlist_select_staff ON public.staff_allowlist;
CREATE POLICY staff_allowlist_select_staff
  ON public.staff_allowlist
  FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

-- Mutations only via service_role / SQL editor (no authenticated write policy).
GRANT SELECT ON public.staff_allowlist TO authenticated;
GRANT ALL ON public.staff_allowlist TO service_role;

-- ---------------------------------------------------------------------------
-- Role resolver — allowlist or customer (never manager by default)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_profile_role_for_email(p_email text)
RETURNS public.app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := public.normalize_staff_email(p_email);
  allowed public.app_role;
BEGIN
  IF normalized IS NULL THEN
    RETURN 'customer'::public.app_role;
  END IF;

  SELECT s.role
  INTO allowed
  FROM public.staff_allowlist AS s
  WHERE s.email = normalized
  LIMIT 1;

  IF allowed IS NOT NULL THEN
    RETURN allowed;
  END IF;

  RETURN 'customer'::public.app_role;
END;
$$;

COMMENT ON FUNCTION public.resolve_profile_role_for_email(text) IS
  'Returns owner/manager only for staff_allowlist emails; otherwise customer.';

GRANT EXECUTE ON FUNCTION public.resolve_profile_role_for_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_profile_role_for_email(text) TO service_role;

-- ---------------------------------------------------------------------------
-- Signup / login profile creators
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role public.app_role;
BEGIN
  resolved_role := public.resolve_profile_role_for_email(NEW.email);

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
  'Creates profiles for new auth users. Defaults to customer; staff only via staff_allowlist.';

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
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO auth_user FROM auth.users WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auth user not found' USING ERRCODE = '28000';
  END IF;

  resolved_role := public.resolve_profile_role_for_email(auth_user.email);

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
  'Creates or returns the profile for auth.uid(). New rows are customer unless email is staff-allowlisted.';

-- ---------------------------------------------------------------------------
-- Service-role helper to reconcile profiles with the allowlist
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_staff_allowlist()
RETURNS TABLE (
  promoted integer,
  demoted integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promoted_count integer := 0;
  demoted_count integer := 0;
BEGIN
  WITH updated AS (
    UPDATE public.profiles AS p
    SET role = s.role
    FROM public.staff_allowlist AS s
    WHERE public.normalize_staff_email(p.email) = s.email
      AND p.role IS DISTINCT FROM s.role
    RETURNING p.id
  )
  SELECT count(*)::integer INTO promoted_count FROM updated;

  WITH updated AS (
    UPDATE public.profiles AS p
    SET role = 'customer'::public.app_role
    WHERE p.role IN ('owner'::public.app_role, 'manager'::public.app_role)
      AND NOT EXISTS (
        SELECT 1
        FROM public.staff_allowlist AS s
        WHERE s.email = public.normalize_staff_email(p.email)
      )
    RETURNING p.id
  )
  SELECT count(*)::integer INTO demoted_count FROM updated;

  RETURN QUERY SELECT promoted_count, demoted_count;
END;
$$;

COMMENT ON FUNCTION public.apply_staff_allowlist() IS
  'Promotes allowlisted emails and demotes all other staff to customer. service_role / SQL editor only.';

REVOKE ALL ON FUNCTION public.apply_staff_allowlist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_staff_allowlist() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_staff_allowlist() TO service_role;

-- ---------------------------------------------------------------------------
-- One-time bootstrap: keep up to 2 earliest staff, demote the rest
-- ---------------------------------------------------------------------------
INSERT INTO public.staff_allowlist (email, role)
SELECT
  public.normalize_staff_email(p.email),
  p.role
FROM public.profiles AS p
WHERE p.role IN ('owner'::public.app_role, 'manager'::public.app_role)
  AND public.normalize_staff_email(p.email) IS NOT NULL
ORDER BY
  CASE p.role
    WHEN 'owner'::public.app_role THEN 0
    ELSE 1
  END,
  p.created_at ASC
LIMIT 2
ON CONFLICT (email) DO NOTHING;

SELECT public.apply_staff_allowlist();
