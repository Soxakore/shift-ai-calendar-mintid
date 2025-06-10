-- Fix infinite recursion in manager profiles policy
-- This migration removes the problematic recursive policy and replaces it with a safer version

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Managers can view department profiles" ON public.profiles;

-- DISABLED: Manager policy temporarily disabled to prevent recursion
-- Any policy that queries the profiles table within a profiles policy will cause infinite recursion
-- This will need to be implemented using a different approach, such as:
-- 1. A separate function that doesn't use RLS
-- 2. Application-level access control
-- 3. A view with security definer
-- 
-- For now, managers can access profiles through the application layer with service role

-- CREATE POLICY "Managers can view department profiles" ON public.profiles
-- FOR SELECT
-- USING (false); -- Explicitly disabled

-- Add a comment explaining why this is disabled
COMMENT ON TABLE public.profiles IS 
'Manager department access policy disabled to prevent infinite recursion. Access control handled at application layer.';
