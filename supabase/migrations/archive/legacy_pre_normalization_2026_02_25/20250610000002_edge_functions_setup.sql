-- Edge Functions Database Setup
-- This migration creates the necessary tables and policies for Edge Functions

-- Create schedules table if not exists
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift TEXT,
    break_duration INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create time_logs table if not exists
CREATE TABLE IF NOT EXISTS public.time_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(4,2),
    method TEXT DEFAULT 'manual',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create profiles table if not exists (enhanced version)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT,
    email TEXT,
    user_type TEXT DEFAULT 'Employee',
    department_id UUID,
    organisation_id UUID,
    is_active BOOLEAN DEFAULT true,
    phone TEXT,
    emergency_contact TEXT,
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Use organisations table from base structure (UK spelling)
-- CREATE TABLE IF NOT EXISTS public.organisations (already created in base structure)

-- Create departments table if not exists
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    sent_via TEXT[], -- ['email', 'sms', 'push']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL,
    generated_by UUID REFERENCES auth.users(id),
    organisation_id UUID REFERENCES public.organisations(id),
    department_id UUID REFERENCES public.departments(id),
    start_date DATE,
    end_date DATE,
    data JSONB NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraints to profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_department 
FOREIGN KEY (department_id) REFERENCES public.departments(id);

ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_organisation 
FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON public.schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_date ON public.time_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_organisation ON public.profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_organisation ON public.reports(organisation_id);

-- Row Level Security Policies

-- Schedules RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules" ON public.schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view department schedules" ON public.schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.department_id = p2.department_id
            WHERE p1.user_id = auth.uid() 
            AND p1.user_type IN ('Manager', 'OrgAdmin', 'SuperAdmin')
            AND p2.user_id = schedules.user_id
        )
    );

CREATE POLICY "Managers can insert department schedules" ON public.schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.department_id = p2.department_id
            WHERE p1.user_id = auth.uid() 
            AND p1.user_type IN ('Manager', 'OrgAdmin', 'SuperAdmin')
            AND p2.user_id = schedules.user_id
        )
    );

-- Time Logs RLS
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time logs" ON public.time_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time logs" ON public.time_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view department time logs" ON public.time_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.department_id = p2.department_id
            WHERE p1.user_id = auth.uid() 
            AND p1.user_type IN ('Manager', 'OrgAdmin', 'SuperAdmin')
            AND p2.user_id = time_logs.user_id
        )
    );

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- DISABLED: This policy causes infinite recursion due to querying profiles table within itself
-- CREATE POLICY "Managers can view department profiles" ON public.profiles
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles p1
--             WHERE p1.user_id = auth.uid() 
--             AND p1.user_type IN ('Manager', 'OrgAdmin', 'SuperAdmin')
--             AND (p1.department_id = profiles.department_id OR p1.organisation_id = profiles.organisation_id)
--         )
--     );

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Reports RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view department reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() 
            AND p.user_type IN ('Manager', 'OrgAdmin', 'SuperAdmin')
            AND (p.department_id = reports.department_id OR p.organisation_id = reports.organisation_id)
        )
    );

CREATE POLICY "System can insert reports" ON public.reports
    FOR INSERT WITH CHECK (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_time_logs_updated_at
    BEFORE UPDATE ON public.time_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data if tables are empty
INSERT INTO public.organisations (id, name, settings_json) 
SELECT 'c0baf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7b'::uuid, 'MinTid Demo Company', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE id = 'c0baf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7b');

INSERT INTO public.departments (id, name, organisation_id) 
SELECT 
    'd1eaf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7c'::uuid, 
    'Operations', 
    'c0baf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7b'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE id = 'd1eaf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7c');

INSERT INTO public.departments (id, name, organisation_id) 
SELECT 
    'd2eaf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7d'::uuid, 
    'Customer Service', 
    'c0baf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7b'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Customer Service');
