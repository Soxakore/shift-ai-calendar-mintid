-- 🔍 QUICK DATABASE STATUS CHECK
-- Copy this into Supabase SQL Editor to see what's already configured

-- =============================================================================
-- 1. CHECK AUTH TRIGGER STATUS
-- =============================================================================
SELECT 
    '🔥 AUTH TRIGGER' as component,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CONFIGURED - Auto profile creation active'
        ELSE '❌ MISSING - Need to apply migrations'
    END as status,
    COALESCE(STRING_AGG(trigger_name, ', '), 'No triggers found') as details
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created'

UNION ALL

-- =============================================================================
-- 2. CHECK HELPER FUNCTIONS STATUS  
-- =============================================================================
SELECT 
    '🛠️ HELPER FUNCTIONS' as component,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ CONFIGURED - All auth helpers ready'
        WHEN COUNT(*) > 0 THEN '⚠️ PARTIAL - Some functions missing'
        ELSE '❌ MISSING - Need to apply migrations'
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
  )

UNION ALL

-- =============================================================================
-- 3. CHECK USER/PROFILE SYNC STATUS
-- =============================================================================
SELECT 
    '👥 USER PROFILES' as component,
    CASE 
        WHEN users_without_profiles = 0 THEN '✅ SYNCED - All users have profiles'
        WHEN users_without_profiles <= 2 THEN '⚠️ MOSTLY SYNCED - Few users missing'
        ELSE '❌ OUT OF SYNC - Many users missing profiles'
    END as status,
    CONCAT('Users: ', total_users, ' | Profiles: ', total_profiles, ' | Missing: ', users_without_profiles) as details
FROM (
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.profiles) as total_profiles,
        (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) as users_without_profiles
) as sync_data

UNION ALL

-- =============================================================================
-- 4. CHECK RLS POLICIES STATUS
-- =============================================================================
SELECT 
    '🔒 RLS POLICIES' as component,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ CONFIGURED - Adequate policy coverage'
        WHEN COUNT(*) >= 4 THEN '⚠️ BASIC - May need more policies'
        ELSE '❌ INSUFFICIENT - Security risk'
    END as status,
    CONCAT(COUNT(*), ' policies found on critical tables') as details
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'organisations', 'departments', 'schedules')

UNION ALL

-- =============================================================================
-- 5. CHECK ORGANIZATION TABLE STATUS
-- =============================================================================
SELECT 
    '🏢 ORGANIZATIONS' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organisations')
        THEN CASE 
            WHEN (SELECT COUNT(*) FROM public.organisations) > 0 
            THEN CONCAT('✅ READY - ', (SELECT COUNT(*) FROM public.organisations), ' organizations exist')
            ELSE '⚠️ EMPTY - Table exists but no data'
        END
        ELSE '❌ MISSING - Table not found'
    END as status,
    'Organization creation capability check' as details;

-- =============================================================================
-- 6. SUMMARY AND NEXT STEPS
-- =============================================================================

-- Show immediate action needed
SELECT 
    '🎯 NEXT ACTION' as component,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.triggers 
            WHERE event_object_schema = 'auth' 
              AND event_object_table = 'users'
              AND trigger_name = 'on_auth_user_created'
        ) = 0 THEN '🚨 APPLY COMPLETE_MIGRATION_SCRIPT.sql - Database needs setup'
        WHEN (
            SELECT COUNT(*) FROM auth.users u 
            LEFT JOIN public.profiles p ON u.id = p.user_id 
            WHERE p.user_id IS NULL
        ) > 0 THEN '⚡ RUN: SELECT * FROM public.create_missing_profiles(); - Sync existing users'
        ELSE '🎉 READY TO TEST - Try creating organization and users!'
    END as status,
    'Immediate action required' as details;
