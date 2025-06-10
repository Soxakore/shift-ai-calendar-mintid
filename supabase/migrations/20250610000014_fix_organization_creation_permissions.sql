-- Fix organization creation by allowing super admins to manage organizations
-- This replaces the overly restrictive service-role-only policy

-- Remove the service-role-only policy that prevents web interface access
DROP POLICY IF EXISTS "Service role can manage organisations" ON public.organisations;

-- Allow super admins to create, update, and delete organizations
CREATE POLICY "Super admins can manage organisations"
ON public.organisations
FOR ALL
USING (
  public.is_super_admin()
);

-- Allow org admins to update their own organization (but not create new ones)
CREATE POLICY "Org admins can update their organisation"
ON public.organisations
FOR UPDATE
USING (
  public.is_org_admin() AND 
  id IN (
    SELECT organisation_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND organisation_id IS NOT NULL
      AND is_active = true
  )
);

-- Keep service role access for system operations
CREATE POLICY "Service role can manage organisations for system operations"
ON public.organisations
FOR ALL
USING (auth.role() = 'service_role');
