-- Create test users directly in Supabase for unified login testing
-- Run this in Supabase Studio SQL Editor

-- First, let's create auth users with proper email addresses
-- Note: We'll create these manually through the Studio interface since auth.admin functions are complex

-- Create profiles for our test users
-- We'll use placeholder UUIDs and update them once auth users are created

-- Get the organization ID first
DO $$
DECLARE 
    org_uuid UUID;
BEGIN
    -- Get the existing organization ID
    SELECT id INTO org_uuid FROM organisations LIMIT 1;
    
    -- Insert test user profiles
    INSERT INTO profiles (user_id, username, display_name, user_type, organisation_id, is_active, created_at, updated_at) VALUES
    -- Super Admin - will link to tiktok518@gmail.com
    ('11111111-1111-1111-1111-111111111111', 'tiktok518', 'Super Admin', 'super_admin', NULL, true, NOW(), NOW()),
    
    -- Organization Admin - will link to org.admin.test@demo.local  
    ('22222222-2222-2222-2222-222222222222', 'org.admin.test', 'Organization Admin Test', 'org_admin', org_uuid, true, NOW(), NOW()),
    
    -- Manager - will link to manager.test@demo.local
    ('33333333-3333-3333-3333-333333333333', 'manager.test', 'Manager Test', 'manager', org_uuid, true, NOW(), NOW()),
    
    -- Employee - will link to employee@demo.local
    ('44444444-4444-4444-4444-444444444444', 'employee', 'Demo Employee', 'employee', org_uuid, true, NOW(), NOW())
    
    ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        user_type = EXCLUDED.user_type,
        organisation_id = EXCLUDED.organisation_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
        
    -- Show the results
    RAISE NOTICE 'Test profiles created successfully!';
END $$;

-- Verify the profiles were created
SELECT 
    username, 
    user_type, 
    display_name, 
    is_active,
    CASE 
        WHEN organisation_id IS NULL THEN 'No Organization'
        ELSE 'Has Organization'
    END as org_status
FROM profiles 
ORDER BY 
    CASE user_type 
        WHEN 'super_admin' THEN 1
        WHEN 'org_admin' THEN 2  
        WHEN 'manager' THEN 3
        WHEN 'employee' THEN 4
        ELSE 5
    END;
