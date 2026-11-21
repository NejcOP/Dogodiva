ALTER TABLE public.profiles
  ADD COLUMN upcoming_event JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.profiles.upcoming_event IS
  'Customer event planning details used to prefill provider inquiries';
COMMENT ON COLUMN public.profiles.email_notifications IS
  'Whether the customer wants email notifications about provider responses';
