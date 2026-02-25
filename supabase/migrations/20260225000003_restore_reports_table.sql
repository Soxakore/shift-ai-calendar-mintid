-- Patch Set 4: Restore reports persistence table for live analytics actions.

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL DEFAULT 'weekly',
  generated_by uuid,
  organisation_id uuid,
  department_id uuid,
  start_date date,
  end_date date,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS report_type text NOT NULL DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS generated_by uuid,
  ADD COLUMN IF NOT EXISTS organisation_id uuid,
  ADD COLUMN IF NOT EXISTS department_id uuid,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reports_organisation_id ON public.reports (organisation_id);
CREATE INDEX IF NOT EXISTS idx_reports_department_id ON public.reports (department_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'reports_updated_at'
  ) THEN
    CREATE TRIGGER reports_updated_at
      BEFORE UPDATE ON public.reports
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END
$$;

-- Keep reports accessible for both auth and username-password custom sessions.
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.reports TO anon;
GRANT ALL ON TABLE public.reports TO authenticated;
GRANT ALL ON TABLE public.reports TO service_role;
