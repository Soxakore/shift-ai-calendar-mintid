-- Fix infinite recursion in organisation policies during creation
-- This resolves the "infinite recursion detected in policy for relation 'users'" error
-- that occurs when creating organizations through the web interface

-- Remove problematic policies that cause recursion during INSERT operations
DROP POLICY IF EXISTS "Org admins can manage their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Managers can view their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Super admin full access on organisations" ON public.organisations;

-- Create safe non-recursive policies for organisations

-- Allow authenticated users to view organisations they're members of (SELECT only)
CREATE POLICY "Users can view their organisation"
ON public.organisations
FOR SELECT
USING (
  id IN (
    SELECT organisation_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND organisation_id IS NOT NULL
      AND is_active = true
  )
);

-- Allow super admins to view all organisations (SELECT only)
CREATE POLICY "Super admins can view all organisations"
ON public.organisations  
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'super_admin'
      AND is_active = true
  )
);

-- For INSERT/UPDATE/DELETE operations, only allow service role
-- This prevents recursion during organization creation by bypassing user-based checks
CREATE POLICY "Service role can manage organisations"
ON public.organisations
FOR ALL
USING (auth.role() = 'service_role');
