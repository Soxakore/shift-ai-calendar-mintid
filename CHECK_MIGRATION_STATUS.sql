-- Quick verification script to check if migrations have been applied
-- Run this in Supabase SQL Editor to check current status

-- Check if the auth trigger exists
SELECT 
    'AUTH TRIGGER STATUS' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CONFIGURED - Trigger exists'
        ELSE '❌ NOT CONFIGURED - Trigger missing'
    END as status
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created'

UNION ALL

-- Check if helper functions exist
SELECT 
    'HELPER FUNCTIONS STATUS' as check_type,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ CONFIGURED - All functions exist'
        ELSE CONCAT('❌ NOT CONFIGURED - Only ', COUNT(*), ' functions found')
    END as status
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

-- Check user vs profile count
SELECT 
    'USER PROFILE SYNC STATUS' as check_type,
    CASE 
        WHEN users_without_profiles = 0 THEN '✅ SYNCED - All users have profiles'
        ELSE CONCAT('⚠️ NEEDS SYNC - ', users_without_profiles, ' users missing profiles')
    END as status
FROM (
    SELECT COUNT(*) as users_without_profiles
    FROM auth.users u 
    LEFT JOIN public.profiles p ON u.id = p.user_id 
    WHERE p.user_id IS NULL
) as sync_check;
