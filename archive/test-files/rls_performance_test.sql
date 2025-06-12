-- Performance Test for RLS Optimization
-- This script demonstrates the performance improvement from optimizing auth.uid() calls

-- First, let's check that our policies exist and are optimized
-- Show the policy definitions for one of the optimized tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'organisations', 'departments')
ORDER BY tablename, policyname;

-- Check if we have any sample data
SELECT 'organisations' as table_name, count(*) as row_count FROM public.organisations
UNION ALL
SELECT 'departments' as table_name, count(*) as row_count FROM public.departments  
UNION ALL
SELECT 'profiles' as table_name, count(*) as row_count FROM public.profiles;

-- Explain a query that would benefit from RLS optimization
-- This shows the query plan for a super admin checking profiles
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.* 
FROM public.profiles p 
WHERE EXISTS (
    SELECT 1 FROM public.profiles admin_p 
    WHERE admin_p.user_id = (SELECT auth.uid()) 
    AND admin_p.user_type = 'super_admin'
)
LIMIT 10;

-- For comparison, show what the old unoptimized version would look like
-- (This is just for demonstration - we've already fixed the actual policies)
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.* 
FROM public.profiles p 
WHERE EXISTS (
    SELECT 1 FROM public.profiles admin_p 
    WHERE admin_p.user_id = auth.uid()  -- This would be slower at scale
    AND admin_p.user_type = 'super_admin'
)
LIMIT 10;
