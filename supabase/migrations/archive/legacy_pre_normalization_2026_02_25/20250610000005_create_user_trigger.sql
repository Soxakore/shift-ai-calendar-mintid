-- Create Database Trigger for Automatic Profile Creation
-- This migration creates a trigger that automatically creates a profile record
-- when a new auth user is created via supabase.auth.signUp()

-- Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_metadata jsonb;
    org_id uuid;
    dept_id uuid;
BEGIN
    -- Get user metadata from the auth.users record
    user_metadata := NEW.raw_user_meta_data;
    
    -- Log the trigger execution for debugging
    RAISE LOG 'handle_new_user triggered for user: %, metadata: %', NEW.id, user_metadata;
    
    -- Handle organization ID
    org_id := NULL;
    IF user_metadata ? 'organisation_id' AND user_metadata->>'organisation_id' != '' THEN
        org_id := (user_metadata->>'organisation_id')::uuid;
    END IF;
    
    -- Handle department ID  
    dept_id := NULL;
    IF user_metadata ? 'department_id' AND user_metadata->>'department_id' != '' THEN
        dept_id := (user_metadata->>'department_id')::uuid;
    END IF;
    
    -- Insert the profile record
    INSERT INTO public.profiles (
        user_id,
        username,
        display_name,
        user_type,
        organisation_id,
        department_id,
        is_active,
        created_by,
        tracking_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(user_metadata->>'username', NEW.email),
        COALESCE(user_metadata->>'display_name', NEW.email),
        COALESCE(user_metadata->>'user_type', 'employee'),
        org_id,
        dept_id,
        true,
        user_metadata->>'created_by',
        gen_random_uuid()::text,
        now(),
        now()
    );
    
    RAISE LOG 'Profile created for user: % with username: %', NEW.id, COALESCE(user_metadata->>'username', NEW.email);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- Add comments for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile record when a new auth user is created via signUp()';

-- Create an additional policy to allow the trigger to insert profiles
CREATE POLICY "Trigger can insert profiles"
ON public.profiles
FOR INSERT
TO supabase_auth_admin
WITH CHECK (true);

-- Also ensure service role can manage profiles during user operations
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.organisations TO service_role;
GRANT ALL ON public.departments TO service_role;
