-- Migration: Storage Optimization Infrastructure
-- Created: 2025-06-11
-- Description: Creates storage optimization tables, buckets, and triggers

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
('schedules', 'schedules', false, 5242880, ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
('reports', 'reports', false, 10485760, ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
('temp-uploads', 'temp-uploads', false, 5242880, NULL)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage usage tracking table
CREATE TABLE IF NOT EXISTS public.storage_usage_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
    bucket_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    mime_type text,
    is_compressed boolean DEFAULT false,
    compression_ratio real DEFAULT 1.0,
    access_count integer DEFAULT 0,
    last_accessed timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(bucket_name, file_path)
);

-- Create storage quotas table
CREATE TABLE IF NOT EXISTS public.storage_quotas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE UNIQUE,
    max_storage_bytes bigint DEFAULT 1073741824, -- 1GB default
    current_usage_bytes bigint DEFAULT 0,
    bandwidth_limit_bytes bigint DEFAULT 10737418240, -- 10GB default
    current_bandwidth_bytes bigint DEFAULT 0,
    bandwidth_reset_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create bandwidth usage tracking table
CREATE TABLE IF NOT EXISTS public.bandwidth_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_type text NOT NULL, -- 'upload', 'download', 'delete'
    bucket_name text NOT NULL,
    file_path text,
    bytes_transferred bigint NOT NULL,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create storage analytics view
CREATE OR REPLACE VIEW public.storage_analytics AS
SELECT 
    o.id as organisation_id,
    o.name as organisation_name,
    sq.max_storage_bytes,
    sq.current_usage_bytes,
    sq.bandwidth_limit_bytes,
    sq.current_bandwidth_bytes,
    ROUND((sq.current_usage_bytes::real / sq.max_storage_bytes::real) * 100, 2) as storage_usage_percent,
    ROUND((sq.current_bandwidth_bytes::real / sq.bandwidth_limit_bytes::real) * 100, 2) as bandwidth_usage_percent,
    COUNT(sut.id) as total_files,
    COUNT(sut.id) FILTER (WHERE sut.is_compressed) as compressed_files,
    ROUND(AVG(sut.compression_ratio), 2) as avg_compression_ratio,
    SUM(sut.file_size) as calculated_usage,
    pg_size_pretty(sq.current_usage_bytes) as current_usage_human,
    pg_size_pretty(sq.max_storage_bytes) as max_storage_human,
    pg_size_pretty(sq.current_bandwidth_bytes) as bandwidth_used_human,
    pg_size_pretty(sq.bandwidth_limit_bytes) as bandwidth_limit_human
FROM public.organisations o
LEFT JOIN public.storage_quotas sq ON o.id = sq.organisation_id
LEFT JOIN public.storage_usage_tracking sut ON o.id = sut.organisation_id
GROUP BY o.id, o.name, sq.max_storage_bytes, sq.current_usage_bytes, 
         sq.bandwidth_limit_bytes, sq.current_bandwidth_bytes;

-- Create daily bandwidth summary view
CREATE OR REPLACE VIEW public.daily_bandwidth_summary AS
SELECT 
    organisation_id,
    DATE(created_at) as usage_date,
    operation_type,
    bucket_name,
    COUNT(*) as operation_count,
    SUM(bytes_transferred) as total_bytes,
    pg_size_pretty(SUM(bytes_transferred)) as total_bytes_human,
    AVG(bytes_transferred) as avg_bytes_per_operation
FROM public.bandwidth_usage
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY organisation_id, DATE(created_at), operation_type, bucket_name
ORDER BY usage_date DESC, organisation_id, operation_type;

-- Create storage dashboard view
CREATE OR REPLACE VIEW public.storage_dashboard AS
SELECT 
    sa.*,
    dbs.total_bandwidth_today,
    dbs.total_operations_today,
    recent_files.recent_upload_count,
    large_files.large_file_count,
    old_files.old_file_count
FROM public.storage_analytics sa
LEFT JOIN (
    SELECT 
        organisation_id,
        SUM(bytes_transferred) as total_bandwidth_today,
        COUNT(*) as total_operations_today
    FROM public.bandwidth_usage 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY organisation_id
) dbs ON sa.organisation_id = dbs.organisation_id
LEFT JOIN (
    SELECT 
        organisation_id,
        COUNT(*) as recent_upload_count
    FROM public.storage_usage_tracking 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY organisation_id
) recent_files ON sa.organisation_id = recent_files.organisation_id
LEFT JOIN (
    SELECT 
        organisation_id,
        COUNT(*) as large_file_count
    FROM public.storage_usage_tracking 
    WHERE file_size > 5242880 -- 5MB
    GROUP BY organisation_id
) large_files ON sa.organisation_id = large_files.organisation_id
LEFT JOIN (
    SELECT 
        organisation_id,
        COUNT(*) as old_file_count
    FROM public.storage_usage_tracking 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
    GROUP BY organisation_id
) old_files ON sa.organisation_id = old_files.organisation_id;

-- Create storage optimization recommendations view
CREATE OR REPLACE VIEW public.storage_optimization_recommendations AS
SELECT 
    organisation_id,
    organisation_name,
    ARRAY_REMOVE(ARRAY[
        CASE WHEN storage_usage_percent > 80 THEN 'high_usage_warning' END,
        CASE WHEN bandwidth_usage_percent > 80 THEN 'high_bandwidth_warning' END,
        CASE WHEN total_files > compressed_files * 2 THEN 'compression_opportunity' END,
        CASE WHEN large_file_count > 10 THEN 'large_files_review' END,
        CASE WHEN old_file_count > 50 THEN 'old_files_cleanup' END,
        CASE WHEN avg_compression_ratio > 0.8 THEN 'improve_compression' END
    ], NULL) as recommendations,
    CASE 
        WHEN storage_usage_percent > 90 THEN 'critical'
        WHEN storage_usage_percent > 80 THEN 'warning'
        WHEN storage_usage_percent > 60 THEN 'attention'
        ELSE 'healthy'
    END as status,
    storage_usage_percent,
    bandwidth_usage_percent,
    total_files,
    compressed_files,
    avg_compression_ratio
FROM public.storage_dashboard;

-- Create triggers for automatic tracking

-- Function to update storage usage when files are uploaded/deleted
CREATE OR REPLACE FUNCTION public.handle_storage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Track new file upload
        INSERT INTO public.storage_usage_tracking (
            organisation_id,
            bucket_name,
            file_path,
            file_size,
            mime_type,
            access_count
        ) VALUES (
            (SELECT organisation_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
            NEW.bucket_id,
            NEW.name,
            (NEW.metadata->>'size')::bigint,
            NEW.metadata->>'mimetype',
            1
        ) ON CONFLICT (bucket_name, file_path) DO UPDATE SET
            file_size = EXCLUDED.file_size,
            mime_type = EXCLUDED.mime_type,
            access_count = storage_usage_tracking.access_count + 1,
            updated_at = now();
            
        -- Update organization quota
        UPDATE public.storage_quotas 
        SET 
            current_usage_bytes = current_usage_bytes + (NEW.metadata->>'size')::bigint,
            updated_at = now()
        WHERE organisation_id = (
            SELECT organisation_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
        );
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Track file deletion
        UPDATE public.storage_quotas 
        SET 
            current_usage_bytes = GREATEST(0, current_usage_bytes - (OLD.metadata->>'size')::bigint),
            updated_at = now()
        WHERE organisation_id = (
            SELECT organisation_id FROM public.storage_usage_tracking 
            WHERE bucket_name = OLD.bucket_id AND file_path = OLD.name 
            LIMIT 1
        );
        
        -- Remove from tracking
        DELETE FROM public.storage_usage_tracking 
        WHERE bucket_name = OLD.bucket_id AND file_path = OLD.name;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track bandwidth usage
CREATE OR REPLACE FUNCTION public.track_bandwidth_usage(
    p_operation_type text,
    p_bucket_name text,
    p_file_path text DEFAULT NULL,
    p_bytes_transferred bigint DEFAULT 0
)
RETURNS void AS $$
DECLARE
    user_org_id uuid;
BEGIN
    -- Get user's organization
    SELECT organisation_id INTO user_org_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1;
    
    IF user_org_id IS NOT NULL THEN
        -- Insert bandwidth tracking record
        INSERT INTO public.bandwidth_usage (
            organisation_id,
            user_id,
            operation_type,
            bucket_name,
            file_path,
            bytes_transferred,
            ip_address,
            user_agent
        ) VALUES (
            user_org_id,
            auth.uid(),
            p_operation_type,
            p_bucket_name,
            p_file_path,
            p_bytes_transferred,
            inet_client_addr(),
            current_setting('request.headers')::json->>'user-agent'
        );
        
        -- Update daily bandwidth usage
        UPDATE public.storage_quotas 
        SET 
            current_bandwidth_bytes = current_bandwidth_bytes + p_bytes_transferred,
            updated_at = now()
        WHERE organisation_id = user_org_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on storage.objects (if permissions allow)
-- Note: This might require superuser permissions in Supabase
-- CREATE TRIGGER storage_tracking_trigger
--     AFTER INSERT OR DELETE ON storage.objects
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_storage_change();

-- Function to initialize storage quotas for organizations
CREATE OR REPLACE FUNCTION public.ensure_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.storage_quotas (organisation_id)
    VALUES (NEW.id)
    ON CONFLICT (organisation_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new organizations
CREATE TRIGGER ensure_storage_quota_trigger
    AFTER INSERT ON public.organisations
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_storage_quota();

-- Function to reset daily bandwidth usage
CREATE OR REPLACE FUNCTION public.reset_daily_bandwidth()
RETURNS void AS $$
BEGIN
    UPDATE public.storage_quotas 
    SET 
        current_bandwidth_bytes = 0,
        bandwidth_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE bandwidth_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_usage_tracking_org ON public.storage_usage_tracking(organisation_id);
CREATE INDEX IF NOT EXISTS idx_storage_usage_tracking_bucket ON public.storage_usage_tracking(bucket_name);
CREATE INDEX IF NOT EXISTS idx_storage_usage_tracking_created ON public.storage_usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_bandwidth_usage_org ON public.bandwidth_usage(organisation_id);
CREATE INDEX IF NOT EXISTS idx_bandwidth_usage_date ON public.bandwidth_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_storage_quotas_org ON public.storage_quotas(organisation_id);

-- RLS Policies
ALTER TABLE public.storage_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bandwidth_usage ENABLE ROW LEVEL SECURITY;

-- Storage usage tracking policies
CREATE POLICY "Users can view their org storage usage" ON public.storage_usage_tracking
    FOR SELECT USING (
        organisation_id = (
            SELECT organisation_id FROM public.profiles 
            WHERE user_id = auth.uid() LIMIT 1
        )
    );

CREATE POLICY "Users can insert their org storage usage" ON public.storage_usage_tracking
    FOR INSERT WITH CHECK (
        organisation_id = (
            SELECT organisation_id FROM public.profiles 
            WHERE user_id = auth.uid() LIMIT 1
        )
    );

-- Storage quotas policies
CREATE POLICY "Users can view their org quotas" ON public.storage_quotas
    FOR SELECT USING (
        organisation_id = (
            SELECT organisation_id FROM public.profiles 
            WHERE user_id = auth.uid() LIMIT 1
        )
    );

-- Bandwidth usage policies
CREATE POLICY "Users can view their org bandwidth" ON public.bandwidth_usage
    FOR SELECT USING (
        organisation_id = (
            SELECT organisation_id FROM public.profiles 
            WHERE user_id = auth.uid() LIMIT 1
        )
    );

CREATE POLICY "Users can insert their bandwidth usage" ON public.bandwidth_usage
    FOR INSERT WITH CHECK (
        organisation_id = (
            SELECT organisation_id FROM public.profiles 
            WHERE user_id = auth.uid() LIMIT 1
        )
    );

-- Grant permissions
GRANT SELECT ON public.storage_analytics TO authenticated;
GRANT SELECT ON public.daily_bandwidth_summary TO authenticated;
GRANT SELECT ON public.storage_dashboard TO authenticated;
GRANT SELECT ON public.storage_optimization_recommendations TO authenticated;

GRANT EXECUTE ON FUNCTION public.track_bandwidth_usage(text, text, text, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_daily_bandwidth() TO service_role;

GRANT ALL ON public.storage_usage_tracking TO service_role;
GRANT ALL ON public.storage_quotas TO service_role;
GRANT ALL ON public.bandwidth_usage TO service_role;

-- Initialize storage quotas for existing organizations
INSERT INTO public.storage_quotas (organisation_id)
SELECT id FROM public.organisations
ON CONFLICT (organisation_id) DO NOTHING;
