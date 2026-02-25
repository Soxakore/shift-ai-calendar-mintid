-- Fix infinite recursion in schedules and time_logs policies
-- This removes the final recursive policies causing the "infinite recursion detected in policy for relation 'users'" error

-- Remove recursive policies on schedules table
DROP POLICY IF EXISTS "Managers can insert department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can view department schedules" ON public.schedules;

-- Remove recursive policies on time_logs table  
DROP POLICY IF EXISTS "Managers can view department time logs" ON public.time_logs;

-- Add safe non-recursive policies for admin access
CREATE POLICY "Service role access on schedules" ON public.schedules
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access on time_logs" ON public.time_logs  
FOR ALL USING (auth.role() = 'service_role');

-- Note: User-level access policies remain unchanged:
-- - Users can view their own schedules (auth.uid() = user_id)
-- - Users can insert/view their own time logs (auth.uid() = user_id)
