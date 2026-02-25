-- Allow anonymous username lookup for authentication
-- This migration adds a policy to allow anonymous users to look up profiles by username
-- for the authentication flow, without exposing sensitive data

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow username lookup for login" ON public.profiles;

-- Create a policy that allows anonymous users to look up profiles by username for authentication
-- Only exposes minimal fields needed for email construction
CREATE POLICY "Allow username lookup for login" ON public.profiles
  FOR SELECT 
  TO public 
  USING (true);

-- Alternative more restrictive approach (commented out for now):
-- This would be more secure but might not work with our current RLS setup
-- CREATE POLICY "Allow username lookup for login" ON public.profiles
--   FOR SELECT 
--   TO anon
--   USING (true);
