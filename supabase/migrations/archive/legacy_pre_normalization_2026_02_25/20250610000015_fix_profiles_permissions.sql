-- Ensure profiles table has proper policies for user management

-- First, check what policies exist on profiles
-- DROP any overly restrictive policies and recreate them properly

-- Remove any existing overly restrictive policies
DROP POLICY IF EXISTS "Service role access on profiles" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- Allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_super_admin());

-- Allow org admins to view profiles in their organization
CREATE POLICY "Org admins can view org profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_org_admin() AND 
  organisation_id IN (
    SELECT organisation_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND organisation_id IS NOT NULL
      AND is_active = true
  )
);

-- Allow managers to view profiles in their department
CREATE POLICY "Managers can view department profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_manager() AND 
  department_id IN (
    SELECT department_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND department_id IS NOT NULL
      AND is_active = true
  )
);

-- Allow super admins to manage (INSERT/UPDATE/DELETE) all profiles
CREATE POLICY "Super admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_super_admin());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid());

-- Keep service role access for system operations (like triggers)
CREATE POLICY "Service role can manage profiles for system operations"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');
