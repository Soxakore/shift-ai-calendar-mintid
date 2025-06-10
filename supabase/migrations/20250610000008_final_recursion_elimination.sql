-- Final fix for ALL infinite recursion policies
-- This migration ensures no table policies reference other tables that might cause circular dependencies

-- Drop any remaining recursive policies
DROP POLICY IF EXISTS "Super admin full access on organisations" ON public.organisations;
DROP POLICY IF EXISTS "Managers can view department profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;

-- Create safe non-recursive policies

-- Organisations access - use service role only
CREATE POLICY "Super admin full access on organisations" ON public.organisations
FOR ALL
USING (auth.role() = 'service_role');

-- Profiles access - use service role for admin access
CREATE POLICY "Super admin full access on profiles" ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Basic user access to their own profiles
CREATE POLICY "Users can view own profiles" ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow user creation/registration
CREATE POLICY "Allow user registration" ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Comments
COMMENT ON POLICY "Super admin full access on organisations" ON public.organisations IS 
'Service role access only - prevents infinite recursion';

COMMENT ON POLICY "Super admin full access on profiles" ON public.profiles IS 
'Service role access only - prevents infinite recursion';

COMMENT ON POLICY "Users can view own profiles" ON public.profiles IS 
'Users can view their own profile data';

-- Verify no recursive policies exist
DO $$
BEGIN
    -- Check for any policies that might reference profiles within profiles policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND qual LIKE '%FROM profiles%'
        AND policyname NOT LIKE '%DISABLED%'
    ) THEN
        RAISE EXCEPTION 'Recursive policy detected on profiles table';
    END IF;
    
    -- Check for any policies that might reference profiles within organisations policies  
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organisations' 
        AND qual LIKE '%FROM profiles%'
        AND policyname NOT LIKE '%DISABLED%'
    ) THEN
        RAISE EXCEPTION 'Recursive policy detected on organisations table';
    END IF;
    
    RAISE NOTICE 'All recursive policies have been eliminated successfully';
END $$;
