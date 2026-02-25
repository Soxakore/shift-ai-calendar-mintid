-- Create auth helper functions for RLS policies
-- These functions help determine user roles and organization membership safely
-- Note: Created in public schema due to auth schema permission restrictions

-- Function to check if current user is a manager (includes org_admin and super_admin)
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type IN ('manager', 'org_admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Function to check if current user is an org_admin (includes super_admin)
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type IN ('org_admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Function to check if current user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'super_admin'
      AND is_active = true
  );
$$;

-- Function to get current user's organisation_id
CREATE OR REPLACE FUNCTION public.current_organisation_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organisation_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- Function to get current user's department_id
CREATE OR REPLACE FUNCTION public.current_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT department_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- Function to get current user's user_type
CREATE OR REPLACE FUNCTION public.current_user_type()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT user_type 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_organisation_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_type() TO authenticated;

-- Note: Organisation policies are created in a separate migration to avoid recursion
-- See: 20250610000012_fix_organisation_creation_recursion.sql
