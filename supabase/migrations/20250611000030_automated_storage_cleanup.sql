-- Migration: Automated Storage Cleanup System
-- Created: 2025-06-11
-- Description: Implements automated storage cleanup jobs and optimization functions

-- Create cleanup configuration table
CREATE TABLE IF NOT EXISTS public.storage_cleanup_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name text NOT NULL UNIQUE,
    enabled boolean DEFAULT true,
    schedule_cron text, -- For future cron job integration
    last_run timestamp with time zone,
    next_run timestamp with time zone,
    total_files_cleaned integer DEFAULT 0,
    total_space_saved bigint DEFAULT 0,
    config_json jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default cleanup jobs
INSERT INTO public.storage_cleanup_config (job_name, schedule_cron, config_json) VALUES 
('temp_file_cleanup', '0 2 * * *', '{"retention_hours": 24, "bucket": "temp-uploads"}'),
('old_schedule_cleanup', '0 3 * * 0', '{"retention_days": 180, "bucket": "schedules"}'),
('unused_file_cleanup', '0 4 * * 1', '{"retention_days": 30, "min_access_count": 0}'),
('large_file_compression', '0 5 * * *', '{"min_size_mb": 5, "target_compression": 0.7}')
ON CONFLICT (job_name) DO NOTHING;

-- Enhanced cleanup function with logging
CREATE OR REPLACE FUNCTION public.run_storage_cleanup(p_job_name text DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    job_config record;
    cleanup_result jsonb;
    total_cleaned integer := 0;
    total_saved bigint := 0;
    job_results jsonb[] := '{}';
BEGIN
    -- If specific job name provided, run only that job
    IF p_job_name IS NOT NULL THEN
        SELECT * INTO job_config 
        FROM public.storage_cleanup_config 
        WHERE job_name = p_job_name AND enabled = true;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Job not found or disabled: ' || p_job_name
            );
        END IF;
        
        -- Run the specific job
        cleanup_result := run_cleanup_job(job_config);
        RETURN cleanup_result;
    END IF;
    
    -- Run all enabled jobs
    FOR job_config IN 
        SELECT * FROM public.storage_cleanup_config 
        WHERE enabled = true 
        ORDER BY job_name
    LOOP
        BEGIN
            cleanup_result := run_cleanup_job(job_config);
            job_results := job_results || cleanup_result;
            
            -- Update totals
            total_cleaned := total_cleaned + (cleanup_result->>'files_cleaned')::integer;
            total_saved := total_saved + (cleanup_result->>'space_saved')::bigint;
            
            -- Update job run time
            UPDATE public.storage_cleanup_config 
            SET 
                last_run = now(),
                total_files_cleaned = total_files_cleaned + (cleanup_result->>'files_cleaned')::integer,
                total_space_saved = total_space_saved + (cleanup_result->>'space_saved')::bigint,
                updated_at = now()
            WHERE id = job_config.id;
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with other jobs
            job_results := job_results || jsonb_build_object(
                'job_name', job_config.job_name,
                'success', false,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'total_files_cleaned', total_cleaned,
        'total_space_saved', total_saved,
        'space_saved_human', pg_size_pretty(total_saved),
        'jobs_run', array_length(job_results, 1),
        'job_results', job_results,
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to run individual cleanup jobs
CREATE OR REPLACE FUNCTION run_cleanup_job(job_config record)
RETURNS jsonb AS $$
DECLARE
    files_cleaned integer := 0;
    space_saved bigint := 0;
    config jsonb;
BEGIN
    config := job_config.config_json;
    
    CASE job_config.job_name
        WHEN 'temp_file_cleanup' THEN
            -- Clean up temporary files
            WITH deleted_files AS (
                DELETE FROM storage.objects 
                WHERE bucket_id = 'temp-uploads'
                AND created_at < NOW() - INTERVAL '1 hour' * (config->>'retention_hours')::integer
                RETURNING name, (metadata->>'size')::bigint as file_size
            )
            SELECT COUNT(*), COALESCE(SUM(file_size), 0) 
            INTO files_cleaned, space_saved
            FROM deleted_files;
            
            -- Clean up tracking records
            DELETE FROM public.storage_usage_tracking 
            WHERE bucket_name = 'temp-uploads' 
            AND created_at < NOW() - INTERVAL '1 hour' * (config->>'retention_hours')::integer;
            
        WHEN 'old_schedule_cleanup' THEN
            -- Clean up old schedule files
            WITH deleted_files AS (
                DELETE FROM storage.objects 
                WHERE bucket_id = 'schedules'
                AND created_at < NOW() - INTERVAL '1 day' * (config->>'retention_days')::integer
                RETURNING name, (metadata->>'size')::bigint as file_size
            )
            SELECT COUNT(*), COALESCE(SUM(file_size), 0) 
            INTO files_cleaned, space_saved
            FROM deleted_files;
            
        WHEN 'unused_file_cleanup' THEN
            -- Clean up unused files (not accessed for X days)
            WITH unused_files AS (
                SELECT st.bucket_name, st.file_path, st.file_size
                FROM public.storage_usage_tracking st
                WHERE st.access_count <= (config->>'min_access_count')::integer
                AND st.created_at < NOW() - INTERVAL '1 day' * (config->>'retention_days')::integer
                AND st.bucket_name != 'avatars' -- Don't auto-delete avatars
            ), deleted_storage AS (
                DELETE FROM storage.objects so
                USING unused_files uf
                WHERE so.bucket_id = uf.bucket_name
                AND so.name = uf.file_path
                RETURNING uf.file_size
            ), deleted_tracking AS (
                DELETE FROM public.storage_usage_tracking st
                USING unused_files uf
                WHERE st.bucket_name = uf.bucket_name 
                AND st.file_path = uf.file_path
                RETURNING st.file_size
            )
            SELECT COUNT(*), COALESCE(SUM(file_size), 0)
            INTO files_cleaned, space_saved
            FROM deleted_tracking;
            
        WHEN 'large_file_compression' THEN
            -- Identify files that need compression (this would need client-side implementation)
            SELECT COUNT(*), 0 INTO files_cleaned, space_saved
            FROM public.storage_usage_tracking
            WHERE NOT is_compressed 
            AND file_size > (config->>'min_size_mb')::integer * 1024 * 1024
            AND mime_type LIKE 'image/%';
            
        ELSE
            RAISE EXCEPTION 'Unknown cleanup job: %', job_config.job_name;
    END CASE;
    
    RETURN jsonb_build_object(
        'job_name', job_config.job_name,
        'success', true,
        'files_cleaned', files_cleaned,
        'space_saved', space_saved,
        'space_saved_human', pg_size_pretty(space_saved),
        'timestamp', now()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'job_name', job_config.job_name,
        'success', false,
        'error', SQLERRM,
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage cleanup statistics
CREATE OR REPLACE FUNCTION public.get_storage_cleanup_stats()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    WITH job_stats AS (
        SELECT 
            job_name,
            enabled,
            last_run,
            total_files_cleaned,
            total_space_saved,
            pg_size_pretty(total_space_saved) as space_saved_human
        FROM public.storage_cleanup_config
        ORDER BY job_name
    ), overall_stats AS (
        SELECT 
            SUM(total_files_cleaned) as total_files,
            SUM(total_space_saved) as total_space,
            pg_size_pretty(SUM(total_space_saved)) as total_space_human,
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE enabled) as active_jobs
        FROM public.storage_cleanup_config
    )
    SELECT jsonb_build_object(
        'overall', row_to_json(overall_stats),
        'jobs', array_agg(row_to_json(job_stats)),
        'last_updated', now()
    ) INTO result
    FROM job_stats, overall_stats
    GROUP BY overall_stats.*;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to optimize storage quotas based on actual usage
CREATE OR REPLACE FUNCTION public.optimize_storage_quotas()
RETURNS jsonb AS $$
DECLARE
    org_record record;
    optimizations integer := 0;
    total_saved bigint := 0;
BEGIN
    -- Update storage quotas based on actual usage
    FOR org_record IN 
        SELECT 
            sq.organisation_id,
            sq.current_usage_bytes,
            sq.max_storage_bytes,
            COALESCE(SUM(sut.file_size), 0) as actual_usage
        FROM public.storage_quotas sq
        LEFT JOIN public.storage_usage_tracking sut ON sq.organisation_id = sut.organisation_id
        GROUP BY sq.organisation_id, sq.current_usage_bytes, sq.max_storage_bytes
    LOOP
        -- Update current usage if different from actual
        IF org_record.current_usage_bytes != org_record.actual_usage THEN
            UPDATE public.storage_quotas 
            SET 
                current_usage_bytes = org_record.actual_usage,
                updated_at = now()
            WHERE organisation_id = org_record.organisation_id;
            
            optimizations := optimizations + 1;
            total_saved := total_saved + ABS(org_record.current_usage_bytes - org_record.actual_usage);
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'organizations_optimized', optimizations,
        'total_discrepancy_corrected', total_saved,
        'discrepancy_corrected_human', pg_size_pretty(total_saved),
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.run_storage_cleanup(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_cleanup_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.optimize_storage_quotas() TO authenticated;
GRANT ALL ON public.storage_cleanup_config TO service_role;
GRANT SELECT ON public.storage_cleanup_config TO authenticated;

-- RLS policies for storage_cleanup_config
ALTER TABLE public.storage_cleanup_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cleanup config" ON public.storage_cleanup_config
    FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.storage_cleanup_config
    FOR ALL USING (auth.role() = 'service_role');
