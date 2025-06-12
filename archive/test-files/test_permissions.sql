-- Test the current permissions by creating a simple test organization
-- This can be run directly in the Supabase SQL editor

-- First, check what the current user auth state is
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Check current user profile
SELECT *
FROM public.profiles 
WHERE user_id = auth.uid();

-- Test organization access (SELECT)
SELECT id, name, created_at
FROM public.organisations
ORDER BY created_at DESC
LIMIT 5;

-- Test profile access (SELECT)
SELECT id, username, display_name, user_type, organisation_id
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
