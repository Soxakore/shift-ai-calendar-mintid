-- Migration: Enable flexible user registration with role-based access
-- Date: 2025-06-11
-- Purpose: Allow any user to register via GitHub OAuth and be assigned roles dynamically

-- Enable RLS on all tables if not already enabled
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create flexible user profile policies
CREATE POLICY "Allow profile creation for authenticated users" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow profile viewing for authenticated users" ON user_profiles
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id OR 
        role IN ('super_admin', 'org_admin') OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'org_admin')
        )
    );

CREATE POLICY "Allow profile updates for owners and admins" ON user_profiles
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role = 'super_admin'
        )
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'employee';
    user_email TEXT;
    admin_count INTEGER;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- Check if this is the first user (make them super_admin)
    SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE role = 'super_admin';
    
    IF admin_count = 0 THEN
        default_role := 'super_admin';
    END IF;
    
    -- Create user profile with default role
    INSERT INTO user_profiles (
        user_id,
        full_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(user_email, '@', 1)),
        user_email,
        default_role,
        true,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_registration();

-- Create function to assign roles (callable by super_admin)
CREATE OR REPLACE FUNCTION assign_user_role(
    target_user_id UUID,
    new_role TEXT,
    organisation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Check if current user is super_admin
    SELECT role INTO current_user_role 
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    IF current_user_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super admins can assign roles';
    END IF;
    
    -- Validate role
    IF new_role NOT IN ('super_admin', 'org_admin', 'manager', 'employee') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;
    
    -- Update user role
    UPDATE user_profiles 
    SET 
        role = new_role,
        organisation_id = COALESCE(assign_user_role.organisation_id, user_profiles.organisation_id),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- If assigning org_admin or manager, ensure they have organisation
    IF new_role IN ('org_admin', 'manager') AND organisation_id IS NOT NULL THEN
        -- Create employee record if needed
        INSERT INTO employees (
            user_id,
            organisation_id,
            employee_id,
            department,
            position,
            hire_date,
            is_active
        ) VALUES (
            target_user_id,
            organisation_id,
            'EMP-' || UPPER(SUBSTRING(target_user_id::TEXT, 1, 8)),
            CASE 
                WHEN new_role = 'org_admin' THEN 'Administration'
                WHEN new_role = 'manager' THEN 'Management'
                ELSE 'General'
            END,
            CASE 
                WHEN new_role = 'org_admin' THEN 'Organization Administrator'
                WHEN new_role = 'manager' THEN 'Manager'
                ELSE 'Employee'
            END,
            CURRENT_DATE,
            true
        ) ON CONFLICT (user_id, organisation_id) DO UPDATE SET
            position = EXCLUDED.position,
            department = EXCLUDED.department,
            is_active = true,
            updated_at = NOW();
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role (helper function)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM user_profiles WHERE user_profiles.user_id = get_user_role.user_id;
    RETURN COALESCE(user_role, 'employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for admin user management
CREATE OR REPLACE VIEW admin_user_management AS
SELECT 
    up.user_id,
    up.full_name,
    up.email,
    up.role,
    up.organisation_id,
    o.name as organisation_name,
    up.is_active,
    up.created_at,
    up.updated_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM user_profiles up
LEFT JOIN organisations o ON up.organisation_id = o.id
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- Grant access to admin view for super_admin and org_admin
CREATE POLICY "Admin user management access" ON admin_user_management
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'org_admin')
        )
    );

-- Create function to list pending users (those without proper roles)
CREATE OR REPLACE FUNCTION get_pending_users()
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Only super_admin can see pending users
    IF (SELECT role FROM user_profiles WHERE user_profiles.user_id = auth.uid()) != 'super_admin' THEN
        RAISE EXCEPTION 'Access denied: Only super admins can view pending users';
    END IF;
    
    RETURN QUERY
    SELECT 
        up.user_id,
        up.full_name,
        up.email,
        up.role,
        up.created_at
    FROM user_profiles up
    WHERE up.role = 'employee' 
       OR up.organisation_id IS NULL
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update organisation policies to allow creation by super_admin
DROP POLICY IF EXISTS "Allow organisation creation" ON organisations;
CREATE POLICY "Allow organisation operations" ON organisations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'org_admin')
        )
    );

-- Create notification for new user registrations
CREATE OR REPLACE FUNCTION notify_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for super admins
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
    )
    SELECT 
        up.user_id,
        'New User Registration',
        'New user ' || NEW.full_name || ' (' || NEW.email || ') has registered and needs role assignment.',
        'user_registration',
        false,
        NOW()
    FROM user_profiles up
    WHERE up.role = 'super_admin';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user notifications
DROP TRIGGER IF EXISTS on_new_user_profile_created ON user_profiles;
CREATE TRIGGER on_new_user_profile_created
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION notify_new_user_registration();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_organisation ON user_profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

COMMENT ON FUNCTION handle_new_user_registration() IS 'Automatically creates user profile when new user registers via OAuth';
COMMENT ON FUNCTION assign_user_role(UUID, TEXT, UUID) IS 'Allows super_admin to assign roles to users';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Helper function to get user role';
COMMENT ON FUNCTION get_pending_users() IS 'Returns list of users needing role assignment';
COMMENT ON VIEW admin_user_management IS 'Administrative view for user management';
