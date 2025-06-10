-- COMPREHENSIVE SETUP VERIFICATION
-- Run this in Supabase SQL Editor to check your complete setup status

-- =============================================================================
-- SECTION 1: AUTH TRIGGER VERIFICATION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING AUTH TRIGGER SETUP...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check if the auth trigger exists
SELECT 
    '🔥 AUTH TRIGGER STATUS' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CONFIGURED - Trigger exists and active'
        ELSE '❌ NOT CONFIGURED - Trigger missing'
    END as status,
    COALESCE(STRING_AGG(trigger_name, ', '), 'No triggers found') as details
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- =============================================================================
-- SECTION 2: HELPER FUNCTIONS VERIFICATION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING HELPER FUNCTIONS...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check individual helper functions
SELECT 
    '🛠️ HELPER FUNCTIONS STATUS' as check_type,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ ALL CONFIGURED - All 5+ functions exist'
        WHEN COUNT(*) >= 3 THEN '⚠️ PARTIALLY CONFIGURED - Some functions missing'
        ELSE '❌ NOT CONFIGURED - Most functions missing'
    END as status,
    CONCAT(COUNT(*), ' of 5+ expected functions found') as details
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'is_super_admin', 
    'is_org_admin', 
    'is_manager', 
    'handle_new_user',
    'create_missing_profiles'
  );

-- List found functions
SELECT 
    '📋 FOUND FUNCTIONS' as check_type,
    routine_name as function_name,
    'Found' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'is_super_admin', 
    'is_org_admin', 
    'is_manager', 
    'handle_new_user',
    'create_missing_profiles'
  )
ORDER BY routine_name;

-- =============================================================================
-- SECTION 3: USER/PROFILE SYNC STATUS
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING USER/PROFILE SYNCHRONIZATION...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check user vs profile count
WITH sync_stats AS (
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.profiles) as total_profiles,
        (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) as users_without_profiles
)
SELECT 
    '👥 USER PROFILE SYNC STATUS' as check_type,
    CASE 
        WHEN users_without_profiles = 0 THEN '✅ PERFECTLY SYNCED - All users have profiles'
        WHEN users_without_profiles <= 2 THEN '⚠️ MOSTLY SYNCED - Few users missing profiles'
        ELSE '❌ NEEDS ATTENTION - Many users missing profiles'
    END as status,
    CONCAT('Users: ', total_users, ' | Profiles: ', total_profiles, ' | Missing: ', users_without_profiles) as details
FROM sync_stats;

-- =============================================================================
-- SECTION 4: RLS POLICIES VERIFICATION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING RLS POLICIES...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check critical RLS policies
SELECT 
    '🔒 RLS POLICIES STATUS' as check_type,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ POLICIES CONFIGURED - Adequate coverage'
        WHEN COUNT(*) >= 4 THEN '⚠️ BASIC POLICIES - May need more'
        ELSE '❌ INSUFFICIENT POLICIES - Security risk'
    END as status,
    CONCAT(COUNT(*), ' policies found on critical tables') as details
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'organisations', 'departments', 'schedules');

-- =============================================================================
-- SECTION 5: RECENT ACTIVITY CHECK
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING RECENT ACTIVITY...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check recent profiles created (last 24 hours)
SELECT 
    '📅 RECENT ACTIVITY' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ACTIVE - Recent profile creation detected'
        ELSE '⚠️ QUIET - No recent activity (may be normal)'
    END as status,
    CONCAT(COUNT(*), ' profiles created in last 24 hours') as details
FROM public.profiles 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- =============================================================================
-- SECTION 6: TEST TRIGGER FUNCTIONALITY (Safe test)
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'TESTING TRIGGER FUNCTIONALITY...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Test if we can call the trigger function directly (safe test)
SELECT 
    '🧪 TRIGGER FUNCTION TEST' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
              AND routine_name = 'handle_new_user'
              AND routine_type = 'FUNCTION'
        ) THEN '✅ CALLABLE - Function exists and accessible'
        ELSE '❌ NOT CALLABLE - Function missing or inaccessible'
    END as status,
    'Function handle_new_user() availability check' as details;

-- =============================================================================
-- SECTION 7: ORGANIZATION CREATION TEST
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CHECKING ORGANIZATION CREATION CAPABILITY...';
    RAISE NOTICE '=============================================================================';
END $$;

-- Check if organizations table is accessible and has proper structure
SELECT 
    '🏢 ORGANIZATION SETUP' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_name = 'organisations'
        ) THEN '✅ TABLE EXISTS - Organization creation possible'
        ELSE '❌ TABLE MISSING - Organization creation blocked'
    END as status,
    'Organisations table accessibility check' as details;

-- Check organization count
SELECT 
    '📊 ORGANIZATION COUNT' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' ORGANIZATIONS - System has data')
        ELSE '⚠️ NO ORGANIZATIONS - Fresh system or needs data'
    END as status,
    CONCAT('Current organization count: ', COUNT(*)) as details
FROM public.organisations;

-- =============================================================================
-- SECTION 8: FINAL SUMMARY
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SETUP VERIFICATION COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Review the results above to see your system status.';
    RAISE NOTICE 'Green checkmarks (✅) = Working correctly';
    RAISE NOTICE 'Yellow warnings (⚠️) = Needs attention but functional';
    RAISE NOTICE 'Red X marks (❌) = Requires immediate action';
    RAISE NOTICE '=============================================================================';
END $$;

-- Quick action items if needed
SELECT 
    '🎯 NEXT ACTIONS' as check_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) > 0 
        THEN '⚠️ RUN: SELECT * FROM public.create_missing_profiles(); -- to sync existing users'
        ELSE '✅ NO ACTION NEEDED - System is properly configured'
    END as status,
    'Recommended immediate action' as details;
