-- Patch Set 5: Align notifications with profile-id model and app payload shape.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sent_via text[],
  ADD COLUMN IF NOT EXISTS read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

UPDATE public.notifications
SET
  read = COALESCE(read, is_read, false),
  is_read = COALESCE(is_read, read, false),
  data = COALESCE(data, '{}'::jsonb)
WHERE true;

CREATE OR REPLACE FUNCTION public.sync_notification_read_flags()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.read IS NULL AND NEW.is_read IS NOT NULL THEN
    NEW.read := NEW.is_read;
  ELSIF NEW.is_read IS NULL AND NEW.read IS NOT NULL THEN
    NEW.is_read := NEW.read;
  ELSIF NEW.read IS DISTINCT FROM NEW.is_read THEN
    NEW.is_read := NEW.read;
  END IF;

  NEW.read := COALESCE(NEW.read, false);
  NEW.is_read := COALESCE(NEW.is_read, NEW.read, false);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'notifications_sync_read_flags'
  ) THEN
    CREATE TRIGGER notifications_sync_read_flags
      BEFORE INSERT OR UPDATE ON public.notifications
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_notification_read_flags();
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Custom username-password sessions do not carry Supabase JWTs.
-- Keep notifications available for app-side scope filtering.
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;
