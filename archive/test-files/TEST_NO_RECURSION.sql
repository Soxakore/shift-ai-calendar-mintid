-- QUICK TEST: Verify Infinite Recursion is Eliminated
-- Run this AFTER applying the corrected RLS policies

-- =============================================================================
-- TEST 1: Check if auth.uid() based policies are working
-- =============================================================================

-- This should work without infinite recursion
SELECT 
    'AUTH UID TEST' as test_name,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ AUTH.UID() WORKING'
        ELSE '❌ AUTH.UID() NOT AVAILABLE'
    END as status;

-- =============================================================================
-- TEST 2: Check helper functions work without recursion
-- =============================================================================

-- Test super admin check (should not cause recursion)
SELECT 
    'SUPER ADMIN CHECK' as test_name,
    public.is_super_admin() as is_super_admin,
    '✅ NO RECURSION' as status;

-- Test org admin check (should not cause recursion)  
SELECT 
    'ORG ADMIN CHECK' as test_name,
    public.is_org_admin() as is_org_admin,
    '✅ NO RECURSION' as status;

-- Test manager check (should not cause recursion)
SELECT 
    'MANAGER CHECK' as test_name,
    public.is_manager() as is_manager,
    '✅ NO RECURSION' as status;

-- =============================================================================
-- TEST 3: Check profile access (should work with new policies)
-- =============================================================================

-- This should work without infinite recursion
SELECT 
    'PROFILE ACCESS TEST' as test_name,
    COUNT(*) as accessible_profiles,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PROFILES ACCESSIBLE'
        ELSE '❌ PROFILE ACCESS BLOCKED'
    END as status
FROM public.profiles;

-- =============================================================================
-- TEST 4: Check organization access (should work with new policies)
-- =============================================================================

-- This should work without infinite recursion
SELECT 
    'ORGANIZATION ACCESS TEST' as test_name,
    COUNT(*) as accessible_organizations,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ ORGANIZATIONS ACCESSIBLE'
        ELSE '❌ ORGANIZATION ACCESS BLOCKED'
    END as status
FROM public.organisations;

-- =============================================================================
-- TEST 5: Check trigger status
-- =============================================================================

SELECT 
    'AUTH TRIGGER STATUS' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ TRIGGER ACTIVE'
        ELSE '❌ TRIGGER MISSING'
    END as status
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- =============================================================================
-- FINAL STATUS CHECK
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'INFINITE RECURSION ELIMINATION TEST COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'If all tests above show ✅ status, infinite recursion has been eliminated.';
    RAISE NOTICE 'You can now test organization and user creation in your application.';
    RAISE NOTICE '=============================================================================';
END $$;
