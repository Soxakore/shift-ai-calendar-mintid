-- Patch Set 1: Harden user creation against privilege escalation.
-- This adds a secure wrapper RPC and removes direct anon/auth access
-- to low-level user creation functions.

CREATE OR REPLACE FUNCTION public.resolve_actor_user_id(p_created_by text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_profile_id integer;
BEGIN
  -- Prefer real Supabase auth context when available.
  v_actor_user_id := auth.uid();
  IF v_actor_user_id IS NOT NULL THEN
    RETURN v_actor_user_id;
  END IF;

  -- Fallback for username-password custom session flow.
  IF p_created_by IS NULL OR btrim(p_created_by) = '' THEN
    RETURN NULL;
  END IF;

  -- Try UUID actor id first.
  BEGIN
    v_actor_user_id := p_created_by::uuid;
    RETURN v_actor_user_id;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_actor_user_id := NULL;
  END;

  -- Try profile numeric id fallback.
  BEGIN
    v_actor_profile_id := p_created_by::integer;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;

  SELECT p.user_id
    INTO v_actor_user_id
  FROM public.profiles p
  WHERE p.id = v_actor_profile_id
  LIMIT 1;

  RETURN v_actor_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_actor_user_id(p_created_by text) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_actor_user_id(p_created_by text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_actor_user_id(p_created_by text) TO service_role;

CREATE OR REPLACE FUNCTION public.create_user_secure(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_profile public.profiles%ROWTYPE;
  v_target_org_id uuid;
  v_target_department_id uuid;
  v_department_org_id uuid;
  v_result json;
BEGIN
  IF p_username IS NULL OR btrim(p_username) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Username is required');
  END IF;

  IF p_display_name IS NULL OR btrim(p_display_name) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Display name is required');
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;

  IF p_user_type NOT IN ('org_admin', 'manager', 'employee') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid role requested');
  END IF;

  v_actor_user_id := public.resolve_actor_user_id(p_created_by);
  IF v_actor_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: actor context is missing');
  END IF;

  SELECT p.*
    INTO v_actor_profile
  FROM public.profiles p
  WHERE p.user_id = v_actor_user_id
    AND COALESCE(p.is_active, true) = true
  ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: actor profile not found');
  END IF;

  IF v_actor_profile.user_type NOT IN ('super_admin', 'org_admin', 'manager') THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: insufficient privileges');
  END IF;

  -- Role creation guardrails:
  -- super_admin -> org_admin, manager, employee
  -- org_admin   -> manager, employee (in own organisation)
  -- manager     -> employee (in own department)
  IF v_actor_profile.user_type = 'org_admin' AND p_user_type = 'org_admin' THEN
    RETURN json_build_object('success', false, 'error', 'Org admins cannot create org_admin users');
  END IF;

  IF v_actor_profile.user_type = 'manager' AND p_user_type <> 'employee' THEN
    RETURN json_build_object('success', false, 'error', 'Managers can only create employee users');
  END IF;

  IF v_actor_profile.user_type = 'super_admin' THEN
    v_target_org_id := p_organisation_id;
    v_target_department_id := p_department_id;
  ELSIF v_actor_profile.user_type = 'org_admin' THEN
    IF v_actor_profile.organisation_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Org admin has no organisation scope');
    END IF;

    IF p_organisation_id IS NOT NULL AND p_organisation_id <> v_actor_profile.organisation_id THEN
      RETURN json_build_object('success', false, 'error', 'Cannot create users outside your organisation');
    END IF;

    v_target_org_id := v_actor_profile.organisation_id;
    v_target_department_id := p_department_id;
  ELSE
    -- manager
    IF v_actor_profile.organisation_id IS NULL OR v_actor_profile.department_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Manager profile is missing organisation/department scope');
    END IF;

    IF p_organisation_id IS NOT NULL AND p_organisation_id <> v_actor_profile.organisation_id THEN
      RETURN json_build_object('success', false, 'error', 'Cannot create users outside your organisation');
    END IF;

    IF p_department_id IS NULL THEN
      v_target_department_id := v_actor_profile.department_id;
    ELSIF p_department_id <> v_actor_profile.department_id THEN
      RETURN json_build_object('success', false, 'error', 'Cannot create users outside your department');
    ELSE
      v_target_department_id := p_department_id;
    END IF;

    v_target_org_id := v_actor_profile.organisation_id;
  END IF;

  IF v_target_department_id IS NOT NULL THEN
    SELECT d.organisation_id
      INTO v_department_org_id
    FROM public.departments d
    WHERE d.id = v_target_department_id
    LIMIT 1;

    IF v_department_org_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Selected department does not exist');
    END IF;

    IF v_target_org_id IS NOT NULL AND v_department_org_id <> v_target_org_id THEN
      RETURN json_build_object('success', false, 'error', 'Department does not belong to organisation');
    END IF;

    v_target_org_id := COALESCE(v_target_org_id, v_department_org_id);
  END IF;

  IF v_target_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Target organisation is required');
  END IF;

  IF p_user_type = 'manager' AND v_target_department_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Managers must be assigned to a department');
  END IF;

  v_result := public.create_user_with_credentials(
    btrim(p_username),
    p_password,
    btrim(p_display_name),
    p_user_type,
    v_target_org_id,
    v_target_department_id,
    NULLIF(btrim(COALESCE(p_phone_number, '')), ''),
    v_actor_user_id::text
  );

  RETURN COALESCE(v_result, json_build_object('success', false, 'error', 'User creation returned no result'));
END;
$$;

-- Secure wrapper is the only function exposed to anon/auth clients.
GRANT EXECUTE ON FUNCTION public.create_user_secure(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
) TO anon;

GRANT EXECUTE ON FUNCTION public.create_user_secure(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_user_secure(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
) TO service_role;

-- Remove direct access to low-level creation functions.
REVOKE EXECUTE ON FUNCTION public.create_user_with_credentials(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.create_user_with_credentials(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text
) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.create_user_with_username(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text,
  p_email text
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.create_user_with_username(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid,
  p_department_id uuid,
  p_phone_number text,
  p_created_by text,
  p_email text
) FROM authenticated;
