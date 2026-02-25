-- Ensure OAuth users always get a usable profile and can be role-assigned.

CREATE OR REPLACE FUNCTION public.ensure_authenticated_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_auth_user auth.users%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_username text;
  v_display_name text;
  v_role text := 'employee';
  v_org_id uuid;
  v_dept_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'created', false,
      'profile_id', v_profile.id,
      'user_type', v_profile.user_type
    );
  END IF;

  SELECT * INTO v_auth_user
  FROM auth.users
  WHERE id = v_uid
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auth user not found for %', v_uid;
  END IF;

  v_username := COALESCE(
    NULLIF(v_auth_user.raw_user_meta_data->>'username', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'login', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'user_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'preferred_username', ''),
    NULLIF(split_part(COALESCE(v_auth_user.email, ''), '@', 1), ''),
    'user_' || substr(replace(v_uid::text, '-', ''), 1, 12)
  );

  v_display_name := COALESCE(
    NULLIF(v_auth_user.raw_user_meta_data->>'display_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'full_name', ''),
    NULLIF(v_auth_user.raw_user_meta_data->>'name', ''),
    v_username
  );

  IF lower(COALESCE(v_auth_user.raw_user_meta_data->>'user_type', 'employee')) IN ('super_admin', 'org_admin', 'manager', 'employee') THEN
    v_role := lower(v_auth_user.raw_user_meta_data->>'user_type');
  END IF;

  BEGIN
    v_org_id := NULLIF(v_auth_user.raw_user_meta_data->>'organisation_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_org_id := NULL;
  END;

  BEGIN
    v_dept_id := NULLIF(v_auth_user.raw_user_meta_data->>'department_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_dept_id := NULL;
  END;

  BEGIN
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
      v_uid,
      v_username,
      v_display_name,
      v_role,
      v_org_id,
      v_dept_id,
      true,
      'oauth_auto_provision',
      gen_random_uuid()::text,
      now(),
      now()
    );
  EXCEPTION WHEN unique_violation THEN
    -- Concurrent login/session can race profile creation. Safe to ignore.
    NULL;
  END;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to provision profile for %', v_uid;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'created', true,
    'profile_id', v_profile.id,
    'user_type', v_profile.user_type
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_authenticated_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_authenticated_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_authenticated_profile() TO service_role;

CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  new_role text,
  organisation_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor_role text;
  v_auth_user auth.users%ROWTYPE;
  v_username text;
  v_display_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.user_type INTO v_actor_role
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;

  IF COALESCE(v_actor_role, '') <> 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign roles';
  END IF;

  IF new_role NOT IN ('super_admin', 'org_admin', 'manager', 'employee') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  IF new_role IN ('org_admin', 'manager') AND organisation_id IS NULL THEN
    RAISE EXCEPTION 'organisation_id is required for role %', new_role;
  END IF;

  SELECT * INTO v_auth_user
  FROM auth.users
  WHERE id = target_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target auth user not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = target_user_id) THEN
    v_username := COALESCE(
      NULLIF(v_auth_user.raw_user_meta_data->>'username', ''),
      NULLIF(v_auth_user.raw_user_meta_data->>'login', ''),
      NULLIF(v_auth_user.raw_user_meta_data->>'user_name', ''),
      NULLIF(v_auth_user.raw_user_meta_data->>'preferred_username', ''),
      NULLIF(split_part(COALESCE(v_auth_user.email, ''), '@', 1), ''),
      'user_' || substr(replace(target_user_id::text, '-', ''), 1, 12)
    );

    v_display_name := COALESCE(
      NULLIF(v_auth_user.raw_user_meta_data->>'display_name', ''),
      NULLIF(v_auth_user.raw_user_meta_data->>'full_name', ''),
      NULLIF(v_auth_user.raw_user_meta_data->>'name', ''),
      v_username
    );

    BEGIN
      INSERT INTO public.profiles (
        user_id,
        username,
        display_name,
        user_type,
        is_active,
        created_by,
        tracking_id,
        created_at,
        updated_at
      )
      VALUES (
        target_user_id,
        v_username,
        v_display_name,
        'employee',
        true,
        'role_assignment_bootstrap',
        gen_random_uuid()::text,
        now(),
        now()
      );
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;

  UPDATE public.profiles p
  SET
    user_type = new_role,
    organisation_id = CASE
      WHEN new_role IN ('org_admin', 'manager') THEN organisation_id
      WHEN organisation_id IS NOT NULL THEN organisation_id
      ELSE p.organisation_id
    END,
    is_active = true,
    updated_at = now()
  WHERE p.user_id = target_user_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_user_role(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.user_type INTO v_actor_role
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;

  IF COALESCE(v_actor_role, '') <> 'super_admin' THEN
    RAISE EXCEPTION 'Access denied: Only super admins can view pending users';
  END IF;

  RETURN QUERY
  WITH pending_profiles AS (
    SELECT
      p.user_id,
      COALESCE(
        NULLIF(p.display_name, ''),
        NULLIF(p.username, ''),
        NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
        'User'
      )::text AS full_name,
      COALESCE(
        NULLIF(u.email, ''),
        NULLIF(p.username, '') || '@username.auth',
        'unknown@user.local'
      )::text AS email,
      COALESCE(NULLIF(p.user_type, ''), 'employee')::text AS role,
      COALESCE(u.created_at, p.created_at, now()) AS created_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE p.user_type = 'employee' OR p.organisation_id IS NULL
  ),
  missing_profiles AS (
    SELECT
      u.id AS user_id,
      COALESCE(
        NULLIF(u.raw_user_meta_data->>'name', ''),
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(u.raw_user_meta_data->>'login', ''),
        NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
        'User'
      )::text AS full_name,
      COALESCE(NULLIF(u.email, ''), 'unknown@user.local')::text AS email,
      'employee'::text AS role,
      u.created_at AS created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.user_id IS NULL
  )
  SELECT
    combined.user_id,
    combined.full_name,
    combined.email,
    combined.role,
    combined.created_at
  FROM (
    SELECT * FROM pending_profiles
    UNION
    SELECT * FROM missing_profiles
  ) AS combined
  ORDER BY combined.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_pending_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pending_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_users() TO service_role;
