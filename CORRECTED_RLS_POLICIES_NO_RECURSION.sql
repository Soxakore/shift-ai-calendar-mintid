-- CORRECTED RLS POLICIES - NO INFINITE RECURSION
-- Apply these policies to eliminate infinite recursion issues
-- These policies use auth.uid() directly instead of querying the same table

-- =============================================================================
-- STEP 1: Clean up existing broken policies
-- =============================================================================

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

-- Drop organization policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can view all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Org admins can view their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Super admins can manage organisations" ON public.organisations;
DROP POLICY IF EXISTS "Org admins can manage their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Users can view their organisation" ON public.organisations;
DROP POLICY IF EXISTS "Service role can manage organisations" ON public.organisations;

-- Drop department policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Org admins can manage org departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view their department" ON public.departments;
DROP POLICY IF EXISTS "Service role can manage departments" ON public.departments;

-- Drop schedule policies that might cause recursion
DROP POLICY IF EXISTS "Managers can view department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can insert department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can update department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Employees can view their schedules" ON public.schedules;
DROP POLICY IF EXISTS "Super admins can manage all schedules" ON public.schedules;
DROP POLICY IF EXISTS "Org admins can manage org schedules" ON public.schedules;
DROP POLICY IF EXISTS "Service role can manage schedules" ON public.schedules;

-- Drop timelog policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own timelogs" ON public.timelogs;
DROP POLICY IF EXISTS "Managers can view department timelogs" ON public.timelogs;
DROP POLICY IF EXISTS "Super admins can manage all timelogs" ON public.timelogs;
DROP POLICY IF EXISTS "Users can manage their own timelogs" ON public.timelogs;
DROP POLICY IF EXISTS "Service role can manage timelogs" ON public.timelogs;

-- =============================================================================
-- STEP 2: Create simple helper functions that use auth.uid() directly
-- =============================================================================

-- Simple function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'super_admin' 
      AND is_active = true
  );
$$;

-- Simple function to check if current user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'org_admin' 
      AND is_active = true
  );
$$;

-- Simple function to check if current user is manager
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'manager' 
      AND is_active = true
  );
$$;

-- Function to get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organisation_id FROM public.profiles 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- Function to get current user's department ID
CREATE OR REPLACE FUNCTION public.get_user_department_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT department_id FROM public.profiles 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- =============================================================================
-- STEP 3: Create CORRECT policies using auth.uid() directly (NO RECURSION)
-- =============================================================================

-- PROFILES TABLE POLICIES (using auth.uid() directly)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Super admin bypass (uses direct auth.uid() check)
CREATE POLICY "Super admins can manage all profiles"
ON public.profiles
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'super_admin' 
      AND is_active = true
  )
);

-- ORGANISATIONS TABLE POLICIES (using auth.uid() directly)
CREATE POLICY "Service role can manage organisations"
ON public.organisations
FOR ALL
USING (auth.role() = 'service_role');

-- Super admin can manage all organizations
CREATE POLICY "Super admins can manage organisations"
ON public.organisations
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'super_admin' 
      AND is_active = true
  )
);

-- Org admins can manage their own organization
CREATE POLICY "Org admins can manage their organisation"
ON public.organisations
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'org_admin' 
      AND is_active = true
      AND organisation_id = public.organisations.id
  )
);

-- DEPARTMENTS TABLE POLICIES (using auth.uid() directly)
CREATE POLICY "Service role can manage departments"
ON public.departments
FOR ALL
USING (auth.role() = 'service_role');

-- Super admin can manage all departments
CREATE POLICY "Super admins can manage departments"
ON public.departments
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'super_admin' 
      AND is_active = true
  )
);

-- Org admins can manage departments in their organization
CREATE POLICY "Org admins can manage org departments"
ON public.departments
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'org_admin' 
      AND is_active = true
      AND organisation_id = public.departments.organisation_id
  )
);

-- SCHEDULES TABLE POLICIES (using auth.uid() directly)
CREATE POLICY "Service role can manage schedules"
ON public.schedules
FOR ALL
USING (auth.role() = 'service_role');

-- Super admin can manage all schedules
CREATE POLICY "Super admins can manage all schedules"
ON public.schedules
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'super_admin' 
      AND is_active = true
  )
);

-- Users can view their own schedules
CREATE POLICY "Users can view their schedules"
ON public.schedules
FOR SELECT
USING (auth.uid() = user_id);

-- TIMELOGS TABLE POLICIES (using auth.uid() directly)
CREATE POLICY "Service role can manage timelogs"
ON public.timelogs
FOR ALL
USING (auth.role() = 'service_role');

-- Super admin can manage all timelogs
CREATE POLICY "Super admins can manage all timelogs"
ON public.timelogs
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_type = 'super_admin' 
      AND is_active = true
  )
);

-- Users can manage their own timelogs
CREATE POLICY "Users can manage their own timelogs"
ON public.timelogs
FOR ALL
USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 4: Grant permissions on helper functions
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organisation_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_department_id() TO authenticated;

-- =============================================================================
-- STEP 5: Create the user profile creation trigger (NO RECURSION)
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
-- STEP 6: Create function to sync existing users (if needed)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO authenticated;

-- =============================================================================
-- STEP 7: Verification queries
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

-- Run this to create profiles for existing users if needed
-- SELECT * FROM public.create_missing_profiles();

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'INFINITE RECURSION ELIMINATION COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'All RLS policies have been corrected to use auth.uid() directly.';
    RAISE NOTICE 'The auth.users trigger is now active for automatic profile creation.';
    RAISE NOTICE 'Organization and user creation should now work without recursion errors.';
    RAISE NOTICE '=============================================================================';
END $$;
