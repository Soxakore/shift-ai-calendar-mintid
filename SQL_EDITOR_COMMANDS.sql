-- SQL Commands to Run in Supabase SQL Editor
-- Execute these commands in the SQL Editor section of your Supabase Dashboard
-- These commands create the automatic user profile creation system

-- =============================================================================
-- STEP 1: Create the user profile creation function
-- =============================================================================

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

-- =============================================================================
-- STEP 2: Create the trigger on auth.users table
-- =============================================================================

-- Remove existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 3: Grant necessary permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =============================================================================
-- STEP 4: Verification queries (Run these to confirm everything is working)
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

-- Check if the function exists
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- =============================================================================
-- STEP 5: Test the trigger (Optional - for testing purposes)
-- =============================================================================

-- You can test the trigger by creating a test user (uncomment to use)
-- WARNING: This will create an actual user - only use for testing!

/*
-- Create a test user with metadata
SELECT auth.uid() as current_user_id;

-- Insert test user data (modify email and metadata as needed)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test.user@example.com',
    '$2a$10$dummy.encrypted.password.hash',
    NOW(),
    '{"username": "testuser", "display_name": "Test User", "user_type": "employee"}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
);

-- Check if the profile was created automatically
SELECT p.*, u.email 
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'test.user@example.com';
*/

-- =============================================================================
-- STEP 6: Additional helper queries for debugging
-- =============================================================================

-- View all existing profiles
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

-- Count users vs profiles
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) as users_without_profiles;

-- =============================================================================
-- STEP 7: Create helper function for manual profile creation (if needed)
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

-- Run this function to create profiles for existing users without profiles
-- SELECT * FROM public.create_missing_profiles();

-- =============================================================================
-- INSTRUCTIONS FOR USE:
-- =============================================================================

/*
1. Copy the commands above (sections 1-3) and paste them into the Supabase SQL Editor
2. Run them one section at a time or all together
3. Use the verification queries (section 4) to confirm everything is working
4. If you have existing users without profiles, run the helper function in section 7
5. Test user creation through your application to verify automatic profile creation

The trigger will now automatically create a profile in the public.profiles table
whenever a new user is created in auth.users, using the metadata provided during
user registration.
*/
