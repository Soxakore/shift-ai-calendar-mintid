-- Create the missing create_user_with_username RPC function
-- This function creates users with username-based authentication

CREATE OR REPLACE FUNCTION public.create_user_with_username(
  p_username text,
  p_password text,
  p_display_name text,
  p_user_type text,
  p_organisation_id uuid DEFAULT NULL,
  p_department_id uuid DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_created_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  new_profile record;
  result jsonb;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Create the auth user with email format username@temp.local for username-based login
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
    new_user_id,
    p_username || '@temp.local', -- Use temporary email format
    crypt(p_password, gen_salt('bf')), -- Hash the password
    NOW(), -- Confirm email immediately
    jsonb_build_object(
      'username', p_username,
      'display_name', p_display_name,
      'user_type', p_user_type,
      'organisation_id', p_organisation_id::text,
      'department_id', p_department_id::text,
      'phone_number', p_phone_number,
      'created_by', p_created_by
    ),
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );
  
  -- The trigger will automatically create the profile, so we just need to wait a moment
  -- and then fetch the created profile
  PERFORM pg_sleep(0.1); -- Small delay to ensure trigger completes
  
  -- Fetch the created profile
  SELECT * INTO new_profile 
  FROM public.profiles 
  WHERE user_id = new_user_id;
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id', new_profile.id,
      'user_id', new_profile.user_id,
      'username', new_profile.username,
      'display_name', new_profile.display_name,
      'user_type', new_profile.user_type,
      'organisation_id', new_profile.organisation_id,
      'department_id', new_profile.department_id,
      'is_active', new_profile.is_active,
      'created_at', new_profile.created_at
    ),
    'error', null
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN jsonb_build_object(
      'success', false,
      'data', null,
      'error', SQLERRM
    );
END;
$$;

-- Also create a simplified authentication function for username logins
CREATE OR REPLACE FUNCTION public.authenticate_username_login(
  p_username text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record record;
  profile_record record;
  result jsonb;
BEGIN
  -- Find the user by username (stored as email in format username@temp.local)
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = p_username || '@temp.local'
    AND encrypted_password = crypt(p_password, encrypted_password);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'data', null,
      'error', 'Invalid username or password'
    );
  END IF;
  
  -- Get the profile data
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE user_id = user_record.id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'data', null,
      'error', 'Profile not found'
    );
  END IF;
  
  -- Return success with user data
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'user_id', user_record.id,
      'email', user_record.email,
      'username', profile_record.username,
      'display_name', profile_record.display_name,
      'user_type', profile_record.user_type,
      'organisation_id', profile_record.organisation_id,
      'department_id', profile_record.department_id,
      'is_active', profile_record.is_active
    ),
    'error', null
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'data', null,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_with_username(text, text, text, text, uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_with_username(text, text, text, text, uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.authenticate_username_login(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_username_login(text, text) TO anon;

-- Add comments
COMMENT ON FUNCTION public.create_user_with_username IS 'Creates a new user with username-based authentication';
COMMENT ON FUNCTION public.authenticate_username_login IS 'Authenticates username-based login attempts';
