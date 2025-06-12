-- STEP-BY-STEP SETUP VERIFICATION AND EXECUTION
-- Copy each section and run one at a time in Supabase SQL Editor

-- =============================================================================
-- SECTION 1: Check Current Status (Run this first)
-- =============================================================================

-- Check if the auth trigger exists
SELECT 
    'AUTH TRIGGER STATUS' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ALREADY CONFIGURED'
        ELSE '❌ NEEDS SETUP'
    END as status
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- Check helper functions
SELECT 
    'HELPER FUNCTIONS STATUS' as check_type,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ ALREADY CONFIGURED'
        ELSE '❌ NEEDS SETUP'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_super_admin', 'is_org_admin', 'is_manager', 'handle_new_user', 'create_missing_profiles');

-- =============================================================================
-- SECTION 2: If status shows "NEEDS SETUP", run the complete migration script
-- =============================================================================

-- Copy the entire COMPLETE_MIGRATION_SCRIPT.sql content here and execute it
-- The script is in your project folder and contains all necessary migrations

-- =============================================================================
-- SECTION 3: After running migrations, verify success
-- =============================================================================

-- This should show ✅ CONFIGURED after running the migration script
SELECT 
    'FINAL VERIFICATION' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_schema = 'auth' 
              AND event_object_table = 'users'
              AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ AUTH TRIGGER ACTIVE'
        ELSE '❌ AUTH TRIGGER MISSING'
    END as status

UNION ALL

SELECT 
    'HELPER FUNCTIONS' as check_type,
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
              AND routine_name IN ('is_super_admin', 'is_org_admin', 'is_manager', 'handle_new_user', 'create_missing_profiles')
        ) >= 5 THEN '✅ ALL FUNCTIONS READY'
        ELSE '❌ FUNCTIONS MISSING'
    END as status;
