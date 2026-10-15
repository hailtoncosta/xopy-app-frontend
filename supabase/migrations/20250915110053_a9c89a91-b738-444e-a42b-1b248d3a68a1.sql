-- Add foreign key relationship between service_providers and user_profiles
-- Both tables reference auth.users through user_id and id respectively
-- We need to create a proper relationship

-- First, let's add a foreign key constraint to ensure data integrity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_providers_user_profiles'
        AND table_name = 'service_providers'
    ) THEN
        ALTER TABLE public.service_providers 
        ADD CONSTRAINT fk_service_providers_user_profiles 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update service providers status to approved for existing ones (for testing)
UPDATE public.service_providers 
SET status = 'approved' 
WHERE status = 'pending';