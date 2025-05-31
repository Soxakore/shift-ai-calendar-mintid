-- MinTid Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('super_admin', 'org_admin', 'manager', 'employee')),
    organization_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Super admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id::text = auth.uid()::text 
            AND user_type = 'super_admin'
        )
    );

-- Create policies for organizations  
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM profiles 
            WHERE id::text = auth.uid()::text
        )
    );

CREATE POLICY "Super admins can manage all organizations" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id::text = auth.uid()::text 
            AND user_type = 'super_admin'
        )
    );

-- Insert initial super admin user
-- This creates a profile for your admin email
-- Note: You'll need to manually create the auth user in Supabase dashboard first
INSERT INTO profiles (
    id,
    username, 
    display_name, 
    user_type, 
    is_active
) VALUES (
    gen_random_uuid(),
    'tiktok',
    'System Administrator', 
    'super_admin', 
    true
) ON CONFLICT (username) DO NOTHING;

-- Create auth user function for admin bypass
-- This function allows for admin login with the tiktok username
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
BEGIN
    -- Note: In production, create the admin auth user manually in Supabase dashboard
    -- Email: tiktok518@gmail.com
    -- Password: Hrpr0dect3421!
    -- This ensures the admin can login with username 'tiktok' and password 'Hrpr0dect3421!'
    -- The app will automatically map 'tiktok' -> 'tiktok518@gmail.com' for authentication
    
    -- Update the profile to match the auth user ID if it exists
    -- This will need to be run after creating the auth user manually
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert a default organization
INSERT INTO organizations (
    name,
    description,
    is_active
) VALUES (
    'MinTid System',
    'Default system organization',
    true
) ON CONFLICT DO NOTHING;

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'user_' || NEW.id::text),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
