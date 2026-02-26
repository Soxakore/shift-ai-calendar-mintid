-- Ensure super admin directory counts include auth users that do not yet
-- have a profile row, so Role Mgmt and Users/Overview stay consistent.

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
    WITH profile_users AS (
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
    ),
    missing_auth_users AS (
      SELECT
        NULL::bigint AS id,
        u.id AS user_id,
        COALESCE(
          NULLIF(u.raw_user_meta_data->>'username', ''),
          NULLIF(u.raw_user_meta_data->>'login', ''),
          NULLIF(u.raw_user_meta_data->>'user_name', ''),
          NULLIF(u.raw_user_meta_data->>'preferred_username', ''),
          NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
          'user_' || substr(replace(u.id::text, '-', ''), 1, 12)
        )::text AS username,
        COALESCE(
          NULLIF(u.raw_user_meta_data->>'display_name', ''),
          NULLIF(u.raw_user_meta_data->>'full_name', ''),
          NULLIF(u.raw_user_meta_data->>'name', ''),
          NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
          'User'
        )::text AS display_name,
        u.email::text AS email,
        'employee'::text AS user_type,
        NULL::uuid AS organisation_id,
        NULL::uuid AS department_id,
        true AS is_active,
        NULL::text AS tracking_id,
        NULL::text AS phone_number,
        COALESCE(u.created_at, now()) AS created_at,
        u.updated_at
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.user_id = u.id
      WHERE p.user_id IS NULL
    )
    SELECT
      x.id,
      x.user_id,
      x.username,
      x.display_name,
      x.email,
      x.user_type,
      x.organisation_id,
      x.department_id,
      x.is_active,
      x.tracking_id,
      x.phone_number,
      x.created_at,
      x.updated_at
    FROM (
      SELECT * FROM profile_users
      UNION ALL
      SELECT * FROM missing_auth_users
    ) x
    ORDER BY x.created_at DESC NULLS LAST;
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
