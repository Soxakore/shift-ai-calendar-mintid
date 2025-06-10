-- Fix Infinite Recursion in RLS Policies
-- This migration fixes the infinite recursion issue when creating users
-- by optimizing all auth.uid() calls and fixing circular dependencies

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on organisations" ON public.organisations;
DROP POLICY IF EXISTS "Super admin full access on departments" ON public.departments;

-- Recreate basic user policies with optimized auth.uid() calls
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id) 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- Recreate super admin policies with optimized subqueries
-- Use service role for super admin access to avoid recursion
CREATE POLICY "Super admin full access on profiles" 
ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role');

-- Use service role for organisations access to avoid recursion
CREATE POLICY "Super admin full access on organisations" 
ON public.organisations 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Super admin full access on departments" 
ON public.departments 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.user_type = 'super_admin'
    )
);

-- Add permissive policy for service role to bypass RLS during user creation
CREATE POLICY "Service role bypass" 
ON public.profiles 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add anonymous insert policy for user registration
CREATE POLICY "Allow anonymous user registration"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (true);

-- Add comments explaining the fix
COMMENT ON POLICY "Users can view their own profiles" ON public.profiles IS 
'Fixed infinite recursion by using (SELECT auth.uid()) instead of direct auth.uid() call';

COMMENT ON POLICY "Users can insert their own profiles" ON public.profiles IS 
'Fixed infinite recursion by using (SELECT auth.uid()) instead of direct auth.uid() call';

COMMENT ON POLICY "Users can update their own profiles" ON public.profiles IS 
'Fixed infinite recursion by using (SELECT auth.uid()) instead of direct auth.uid() call';

COMMENT ON POLICY "Users can delete their own profiles" ON public.profiles IS 
'Fixed infinite recursion by using (SELECT auth.uid()) instead of direct auth.uid() call';

COMMENT ON POLICY "Service role bypass" ON public.profiles IS 
'Allows service role to bypass RLS for user creation operations to prevent infinite recursion';

COMMENT ON POLICY "Allow anonymous user registration" ON public.profiles IS 
'Allows anonymous users to insert profiles during registration process';
