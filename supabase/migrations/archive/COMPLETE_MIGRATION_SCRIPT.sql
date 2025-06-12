-- COMPLETE MIGRATION SCRIPT FOR SUPABASE SQL EDITOR
-- Execute this entire script in your Supabase Dashboard SQL Editor
-- This combines all pending migrations to fix infinite recursion and setup auth

-- =============================================================================
-- MIGRATION 1: Fix schedules and timelogs recursion
-- =============================================================================

-- Drop problematic recursive policies
DROP POLICY IF EXISTS "Managers can view department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can insert department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can update department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Employees can view their schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can view their own timelogs" ON public.timelogs;
DROP POLICY IF EXISTS "Managers can view department timelogs" ON public.timelogs;

-- Create safe policies for schedules
CREATE POLICY "Super admins can manage all schedules" ON public.schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'super_admin' AND is_active = true)
);

CREATE POLICY "Org admins can manage org schedules" ON public.schedules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.user_type = 'org_admin' 
      AND p.is_active = true
      AND p.organisation_id IN (
        SELECT DISTINCT d.organisation_id 
        FROM public.departments d 
        WHERE d.id = public.schedules.department_id
      )
  )
);

CREATE POLICY "Service role can manage schedules" ON public.schedules FOR ALL USING (auth.role() = 'service_role');

-- Create safe policies for timelogs  
CREATE POLICY "Super admins can manage all timelogs" ON public.timelogs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'super_admin' AND is_active = true)
);

CREATE POLICY "Users can manage their own timelogs" ON public.timelogs FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage timelogs" ON public.timelogs FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- MIGRATION 2: Create auth helper functions
-- =============================================================================

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'super_admin' 
      AND is_active = true
  );
$$;

-- Helper function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'org_admin' 
      AND is_active = true
  );
$$;

-- Helper function to check if user is manager
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'manager' 
      AND is_active = true
  );
$$;

-- Helper function to get user's organisation ID
CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT organisation_id FROM public.profiles 
  WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Helper function to get user's department ID
CREATE OR REPLACE FUNCTION public.get_user_department_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT department_id FROM public.profiles 
  WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Helper function to check if user can access organisation
CREATE OR REPLACE FUNCTION public.can_access_organisation(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    public.is_super_admin() OR 
    (public.get_user_organisation_id() = org_id AND public.is_org_admin());
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organisation_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_organisation(uuid) TO authenticated;

-- =============================================================================
-- MIGRATION 3: Fix organisation creation recursion
-- =============================================================================

-- Drop all existing organisation policies
DROP POLICY IF EXISTS "Super admins can view all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Org admins can view their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Super admins can manage organisations" ON public.organisations;
DROP POLICY IF EXISTS "Org admins can manage their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Users can view their organisation" ON public.organisations;

-- Create simple, non-recursive policies
CREATE POLICY "Super admins can manage organisations" ON public.organisations FOR ALL USING (public.is_super_admin());
CREATE POLICY "Service role can manage organisations" ON public.organisations FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- MIGRATION 4: Fix organization creation permissions
-- =============================================================================

-- Drop existing department policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Org admins can manage org departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view their department" ON public.departments;

-- Create safe department policies
CREATE POLICY "Super admins can manage departments" ON public.departments FOR ALL USING (public.is_super_admin());
CREATE POLICY "Service role can manage departments" ON public.departments FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- MIGRATION 5: Fix profiles permissions
-- =============================================================================

-- Drop existing profile policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create safe profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_super_admin());
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- MIGRATION 6: Create user trigger system
-- =============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a new profile record for the newly created user
  INSERT INTO public.profiles (
    user_id,
    username,
    display_name,
    user_type,
    organisation_id,
    department_id,
    tracking_id,
    is_active,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'employee')::text,
    CASE 
      WHEN NEW.raw_user_meta_data->>'organisation_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'organisation_id')::uuid
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'department_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'department_id')::uuid
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'tracking_id', gen_random_uuid()::text),
    true,
    NEW.raw_user_meta_data->>'created_by',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, log the error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =============================================================================
-- MIGRATION 7: Create missing profiles for existing users
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS TABLE(created_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    count_created INTEGER := 0;
BEGIN
    -- Create profiles for users that don't have them
    FOR rec IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE p.user_id IS NULL
    LOOP
        INSERT INTO public.profiles (
            user_id,
            username,
            display_name,
            user_type,
            tracking_id,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            rec.id,
            COALESCE(rec.raw_user_meta_data->>'username', SPLIT_PART(rec.email, '@', 1)),
            COALESCE(rec.raw_user_meta_data->>'display_name', rec.raw_user_meta_data->>'name', SPLIT_PART(rec.email, '@', 1)),
            COALESCE(rec.raw_user_meta_data->>'user_type', 'employee')::text,
            gen_random_uuid()::text,
            true,
            NOW(),
            NOW()
        );
        
        count_created := count_created + 1;
    END LOOP;
    
    RETURN QUERY SELECT count_created;
END;
$$;

-- Run the function to create profiles for existing users
SELECT * FROM public.create_missing_profiles();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if the trigger was created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- Check helper functions
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'is_super_admin', 
    'is_org_admin', 
    'is_manager', 
    'handle_new_user',
    'create_missing_profiles'
  );

-- Count users vs profiles
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) as users_without_profiles;

-- View recent profiles
SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.user_type,
    p.is_active,
    u.email,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'MIGRATION COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'All migrations have been applied successfully.';
    RAISE NOTICE 'The auth.users trigger is now active and will automatically create profiles.';
    RAISE NOTICE 'Check the verification queries above to confirm everything is working.';
    RAISE NOTICE '=============================================================================';
END $$;
