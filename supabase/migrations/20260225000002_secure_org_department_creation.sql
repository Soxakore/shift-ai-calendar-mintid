-- Patch Set 2: Secure organisation/department creation RPCs.
-- Enables reliable creation from custom username sessions without bypassing role checks.

CREATE OR REPLACE FUNCTION public.create_organisation_secure(
  p_name text,
  p_alias text DEFAULT NULL::text,
  p_description text DEFAULT NULL::text,
  p_created_by text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_profile public.profiles%ROWTYPE;
  v_existing_org_id uuid;
  v_org public.organisations%ROWTYPE;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Organisation name is required');
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

  IF NOT FOUND OR v_actor_profile.user_type <> 'super_admin' THEN
    RETURN json_build_object('success', false, 'error', 'Only super admins can create organisations');
  END IF;

  SELECT o.id
    INTO v_existing_org_id
  FROM public.organisations o
  WHERE lower(o.name) = lower(btrim(p_name))
  LIMIT 1;

  IF v_existing_org_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Organisation already exists');
  END IF;

  INSERT INTO public.organisations (name, settings_json)
  VALUES (
    btrim(p_name),
    jsonb_build_object(
      'alias', NULLIF(btrim(COALESCE(p_alias, '')), ''),
      'description', NULLIF(btrim(COALESCE(p_description, '')), '')
    )
  )
  RETURNING *
  INTO v_org;

  RETURN json_build_object('success', true, 'data', row_to_json(v_org));
END;
$$;

CREATE OR REPLACE FUNCTION public.create_organization_secure(
  p_name text,
  p_alias text DEFAULT NULL::text,
  p_description text DEFAULT NULL::text,
  p_created_by text DEFAULT NULL::text
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.create_organisation_secure(p_name, p_alias, p_description, p_created_by);
$$;

CREATE OR REPLACE FUNCTION public.create_department_secure(
  p_name text,
  p_organisation_id uuid,
  p_description text DEFAULT NULL::text,
  p_created_by text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_profile public.profiles%ROWTYPE;
  v_org_id uuid;
  v_department public.departments%ROWTYPE;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Department name is required');
  END IF;

  IF p_organisation_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Organisation is required');
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

  IF v_actor_profile.user_type NOT IN ('super_admin', 'org_admin') THEN
    RETURN json_build_object('success', false, 'error', 'Only super admins and org admins can create departments');
  END IF;

  IF v_actor_profile.user_type = 'org_admin'
     AND v_actor_profile.organisation_id IS DISTINCT FROM p_organisation_id THEN
    RETURN json_build_object('success', false, 'error', 'Org admins can only create departments in their own organisation');
  END IF;

  SELECT o.id
    INTO v_org_id
  FROM public.organisations o
  WHERE o.id = p_organisation_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Organisation not found');
  END IF;

  INSERT INTO public.departments (name, organisation_id, description)
  VALUES (
    btrim(p_name),
    p_organisation_id,
    NULLIF(btrim(COALESCE(p_description, '')), '')
  )
  RETURNING *
  INTO v_department;

  RETURN json_build_object('success', true, 'data', row_to_json(v_department));
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organisation_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO anon;
GRANT EXECUTE ON FUNCTION public.create_organisation_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organisation_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO service_role;

GRANT EXECUTE ON FUNCTION public.create_organization_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO anon;
GRANT EXECUTE ON FUNCTION public.create_organization_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_secure(
  p_name text,
  p_alias text,
  p_description text,
  p_created_by text
) TO service_role;

GRANT EXECUTE ON FUNCTION public.create_department_secure(
  p_name text,
  p_organisation_id uuid,
  p_description text,
  p_created_by text
) TO anon;
GRANT EXECUTE ON FUNCTION public.create_department_secure(
  p_name text,
  p_organisation_id uuid,
  p_description text,
  p_created_by text
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_department_secure(
  p_name text,
  p_organisation_id uuid,
  p_description text,
  p_created_by text
) TO service_role;
