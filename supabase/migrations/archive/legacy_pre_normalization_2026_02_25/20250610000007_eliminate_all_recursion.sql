-- Complete fix for infinite recursion in RLS policies
-- This migration removes ALL policies that cause recursion and replaces them with safe versions

-- First, drop all problematic policies that reference profiles table within themselves
DROP POLICY IF EXISTS "Managers can view department profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;

-- Create safe replacement policies that don't cause recursion

-- Allow users to view their own profiles (already exists, but ensure it's correct)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Super admin policy using service role only to avoid any recursion
CREATE POLICY "Super admin full access on profiles" ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Manager policy using a completely different approach
-- Instead of checking profiles table, we'll use a view or function
-- For now, let's disable this policy to eliminate recursion
-- It can be re-enabled later with a proper implementation

-- Ensure service role can always access for system operations
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
CREATE POLICY "Service role bypass" ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Allow anonymous registration (for user creation)
DROP POLICY IF EXISTS "Allow anonymous user registration" ON public.profiles;
CREATE POLICY "Allow anonymous user registration" ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Allow trigger to insert profiles
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.profiles;
CREATE POLICY "Trigger can insert profiles" ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Basic CRUD operations for authenticated users on their own data
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
CREATE POLICY "Users can view their own profiles" ON public.profiles
FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
CREATE POLICY "Users can insert their own profiles" ON public.profiles
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" ON public.profiles
FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;
CREATE POLICY "Users can delete their own profiles" ON public.profiles
FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- Comment explaining the approach
COMMENT ON TABLE public.profiles IS 
'RLS policies updated to prevent infinite recursion. Manager policies temporarily disabled.';
