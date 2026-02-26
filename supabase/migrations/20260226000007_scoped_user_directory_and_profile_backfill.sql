-- Patch set: keep role-management counts and dashboard counts in sync.
-- 1) Bootstrap missing profile rows for auth users.
-- 2) Expose a scoped user directory RPC for role-consistent reads.

CREATE OR REPLACE FUNCTION public.bootstrap_profile_from_auth_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_user auth.users%ROWTYPE;
  v_username text;
  v_display_name text;
  v_role text := 'employee';
  v_org_id uuid;
  v_department_id uuid;
  v_rows integer := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = p_user_id) THEN
    RETURN false;
  END IF;

  SELECT * INTO v_auth_user
  FROM auth.users u
  WHERE u.id = p_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_username := COALESCE(
    NULLIF(v_auth_user.raw_user_meta_data->>'username', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'login', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'user_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'preferred_username', ''),
    NULLIF(split_part(COALESCE(v_auth_user.email, ''), '@', 1), ''),
    'user_' || substr(replace(v_auth_user.id::text, '-', ''), 1, 12)
  );

  v_display_name := COALESCE(
    NULLIF(v_auth_user.raw_user_meta_data->>'display_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'full_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'name', ''),
    v_username
  );

  IF lower(COALESCE(v_auth_user.raw_user_meta_data->>'user_type', '')) IN ('super_admin', 'org_admin', 'manager', 'employee') THEN
    v_role := lower(v_auth_user.raw_user_meta_data->>'user_type');
  ELSIF lower(COALESCE(v_auth_user.raw_user_meta_data->>'role', '')) IN ('super_admin', 'org_admin', 'manager', 'employee') THEN
    v_role := lower(v_auth_user.raw_user_meta_data->>'role');
  END IF;

  BEGIN
    IF NULLIF(v_auth_user.raw_user_meta_data->>'organisation_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      v_org_id := (v_auth_user.raw_user_meta_data->>'organisation_id')::uuid;
    ELSE
      v_org_id := NULL;
    END IF;
  EXCEPTION WHEN others THEN
    v_org_id := NULL;
  END;

  IF v_org_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.organisations o WHERE o.id = v_org_id) THEN
    v_org_id := NULL;
  END IF;

  BEGIN
    IF NULLIF(v_auth_user.raw_user_meta_data->>'department_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      v_department_id := (v_auth_user.raw_user_meta_data->>'department_id')::uuid;
    ELSE
      v_department_id := NULL;
    END IF;
  EXCEPTION WHEN others THEN
    v_department_id := NULL;
  END;

  IF v_department_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.id = v_department_id) THEN
    v_department_id := NULL;
  END IF;

  INSERT INTO public.profiles (
    user_id,
    username,
    display_name,
    user_type,
    organisation_id,
    department_id,
    is_active,
    created_by,
    tracking_id,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_user.id,
    v_username,
    v_display_name,
    v_role,
    v_org_id,
    v_department_id,
    true,
    'auth_profile_bootstrap',
    gen_random_uuid()::text,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_profile_from_auth_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_profile_from_auth_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_profile_from_auth_user(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.backfill_missing_profiles_from_auth()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_user_id uuid;
  v_inserted integer := 0;
BEGIN
  FOR v_auth_user_id IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.user_id IS NULL
  LOOP
    IF public.bootstrap_profile_from_auth_user(v_auth_user_id) THEN
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_missing_profiles_from_auth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_missing_profiles_from_auth() TO authenticated;
GRANT EXECUTE ON FUNCTION public.backfill_missing_profiles_from_auth() TO service_role;

CREATE OR REPLACE FUNCTION public.handle_auth_user_profile_bootstrap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  PERFORM public.bootstrap_profile_from_auth_user(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Never block auth signup flow; best-effort profile bootstrap.
    RAISE WARNING 'Profile bootstrap failed for auth user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile_bootstrap ON auth.users;
CREATE TRIGGER on_auth_user_created_profile_bootstrap
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_profile_bootstrap();

GRANT EXECUTE ON FUNCTION public.handle_auth_user_profile_bootstrap() TO service_role;

CREATE OR REPLACE FUNCTION public.get_scoped_user_directory()
RETURNS TABLE (
  id bigint,
  user_id uuid,
  username text,
  display_name text,
  email text,
  user_type text,
  organisation_id uuid,
  department_id uuid,
  is_active boolean,
  tracking_id text,
  phone_number text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor_profile public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM public.ensure_authenticated_profile();

  SELECT p.*
  INTO v_actor_profile
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: profile not found';
  END IF;

  IF v_actor_profile.user_type = 'super_admin' THEN
    RETURN QUERY
    SELECT
      p.id,
      p.user_id,
      p.username,
      p.display_name,
      u.email,
      COALESCE(NULLIF(p.user_type, ''), 'employee') AS user_type,
      p.organisation_id,
      p.department_id,
      COALESCE(p.is_active, true) AS is_active,
      p.tracking_id,
      p.phone_number,
      COALESCE(p.created_at, u.created_at, now()) AS created_at,
      p.updated_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    ORDER BY COALESCE(p.created_at, u.created_at, now()) DESC;
    RETURN;
  END IF;

  IF v_actor_profile.user_type = 'org_admin' THEN
    RETURN QUERY
    SELECT
      p.id,
      p.user_id,
      p.username,
      p.display_name,
      u.email,
      COALESCE(NULLIF(p.user_type, ''), 'employee') AS user_type,
      p.organisation_id,
      p.department_id,
      COALESCE(p.is_active, true) AS is_active,
      p.tracking_id,
      p.phone_number,
      COALESCE(p.created_at, u.created_at, now()) AS created_at,
      p.updated_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE
      (
        v_actor_profile.organisation_id IS NOT NULL
        AND p.organisation_id = v_actor_profile.organisation_id
      )
      OR p.user_id = auth.uid()
    ORDER BY COALESCE(p.created_at, u.created_at, now()) DESC;
    RETURN;
  END IF;

  IF v_actor_profile.user_type = 'manager' THEN
    RETURN QUERY
    SELECT
      p.id,
      p.user_id,
      p.username,
      p.display_name,
      u.email,
      COALESCE(NULLIF(p.user_type, ''), 'employee') AS user_type,
      p.organisation_id,
      p.department_id,
      COALESCE(p.is_active, true) AS is_active,
      p.tracking_id,
      p.phone_number,
      COALESCE(p.created_at, u.created_at, now()) AS created_at,
      p.updated_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE
      (
        v_actor_profile.organisation_id IS NOT NULL
        AND v_actor_profile.department_id IS NOT NULL
        AND p.organisation_id = v_actor_profile.organisation_id
        AND p.department_id = v_actor_profile.department_id
      )
      OR p.user_id = auth.uid()
    ORDER BY COALESCE(p.created_at, u.created_at, now()) DESC;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    u.email,
    COALESCE(NULLIF(p.user_type, ''), 'employee') AS user_type,
    p.organisation_id,
    p.department_id,
    COALESCE(p.is_active, true) AS is_active,
    p.tracking_id,
    p.phone_number,
    COALESCE(p.created_at, u.created_at, now()) AS created_at,
    p.updated_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE p.user_id = auth.uid()
  ORDER BY COALESCE(p.created_at, u.created_at, now()) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_scoped_user_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_scoped_user_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_scoped_user_directory() TO service_role;

SELECT public.backfill_missing_profiles_from_auth();
