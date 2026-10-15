-- Ensure push_subscriptions can be upserted by endpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'push_subscriptions_endpoint_key'
  ) THEN
    ALTER TABLE public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);
  END IF;
END $$;

-- Helpful index for lookups by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
ON public.push_subscriptions (user_id);
