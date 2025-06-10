-- Create the correct profiles table structure for MinTid
-- This creates the profiles table with proper Supabase auth integration

-- Create organisations table first
CREATE TABLE IF NOT EXISTS public.organisations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    settings_json jsonb DEFAULT '{}',
    tracking_id text DEFAULT gen_random_uuid()::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    organisation_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create the profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username text UNIQUE,
    display_name text,
    user_type text NOT NULL DEFAULT 'employee',
    organisation_id uuid REFERENCES public.organisations(id),
    department_id uuid REFERENCES public.departments(id),
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    phone_number text,
    qr_code_enabled boolean DEFAULT false,
    qr_code_expires_at timestamp with time zone,
    password_changed_at timestamp with time zone,
    tracking_id text DEFAULT gen_random_uuid()::text,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Super admin policies for all tables
CREATE POLICY "Super admin full access on profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.user_type = 'super_admin'
    )
);

-- DISABLED: Recursive policy replaced with service role access
-- CREATE POLICY "Super admin full access on organisations" 
-- ON public.organisations 
-- FOR ALL 
-- TO authenticated 
-- USING (
--     EXISTS (
--         SELECT 1 FROM public.profiles p 
--         WHERE p.user_id = auth.uid() 
--         AND p.user_type = 'super_admin'
--     )
-- );

CREATE POLICY "Super admin full access on departments" 
ON public.departments 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.user_type = 'super_admin'
    )
);

-- Function to auto-generate tracking ID on profile insert
CREATE OR REPLACE FUNCTION public.ensure_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate tracking ID if not provided
    IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
        NEW.tracking_id := gen_random_uuid()::text;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-generate tracking IDs on insert
CREATE TRIGGER profile_tracking_id_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_tracking_id();

-- Create super admin ensure function
CREATE OR REPLACE FUNCTION public.ensure_super_admin_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create super admin profile if the user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'ea6e7b85-cafa-4725-a9fd-cd9c6cd6d11b') THEN
        INSERT INTO public.profiles (
            user_id,
            username,
            display_name,
            user_type,
            organisation_id,
            tracking_id,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            'ea6e7b85-cafa-4725-a9fd-cd9c6cd6d11b',
            'tiktok518',
            'TikTok518 Super Admin',
            'super_admin',
            (SELECT id FROM public.organisations LIMIT 1),
            gen_random_uuid()::text,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            user_type = 'super_admin',
            is_active = true,
            tracking_id = COALESCE(profiles.tracking_id, gen_random_uuid()::text),
            updated_at = NOW();
    END IF;
END;
$$;

-- Insert sample organisation if none exists
INSERT INTO public.organisations (name, settings_json) 
SELECT 'MinTid Demo Company', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.organisations);

-- Execute super admin setup
SELECT public.ensure_super_admin_access();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.ensure_tracking_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_super_admin_access() TO authenticated;
