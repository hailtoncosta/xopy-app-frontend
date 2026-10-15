-- ============================================
-- FIX CRITICAL SECURITY ISSUES
-- ============================================

-- ISSUE 1: Protect seller_info in products table
-- Create a view that hides sensitive seller information

CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  user_id,
  title,
  description,
  category,
  price,
  quantity,
  seller_type,
  product_type,
  manufacturing_date,
  -- Redact sensitive fields from seller_info
  jsonb_build_object(
    'city', seller_info->>'city',
    'state', seller_info->>'state',
    'neighborhood', seller_info->>'neighborhood',
    'type', seller_info->>'type'
  ) as seller_info,
  status,
  created_at,
  updated_at,
  is_featured,
  approval_status,
  images,
  unit,
  approval_date,
  condition,
  location,
  expires_at
FROM public.products
WHERE status = 'active';

-- Grant access to the public view
GRANT SELECT ON public.products_public TO authenticated;
GRANT SELECT ON public.products_public TO anon;

-- ============================================
-- ISSUE 2: Protect service provider contact info
-- ============================================

-- Create a view for public service provider listing (minimal data)
CREATE OR REPLACE VIEW public.service_providers_public AS
SELECT 
  id,
  name,
  category,
  city,
  neighborhood,
  experience,
  daily_rate,
  description,
  specialties,
  status,
  created_at
FROM public.service_providers
WHERE status = 'approved';

-- Grant access to the public view
GRANT SELECT ON public.service_providers_public TO authenticated;
GRANT SELECT ON public.service_providers_public TO anon;

-- Create function to check if user can see provider contact info
-- Users can see contact info only if they have an active conversation with the provider
CREATE OR REPLACE FUNCTION public.can_access_provider_contact(provider_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    INNER JOIN public.service_providers sp ON sp.id = c.service_provider_id
    WHERE sp.id = provider_id
    AND c.user_id = auth.uid()
    AND c.status = 'active'
  ) OR public.is_admin();
$$;

-- Update service_providers policy to restrict contact info visibility
DROP POLICY IF EXISTS "Authenticated users can view approved providers" ON public.service_providers;

-- Create new policy: only show full data if user has conversation or is admin
CREATE POLICY "Users see full provider data if they have conversation"
ON public.service_providers
FOR SELECT
USING (
  -- Admins see everything
  public.is_admin()
  OR
  -- Users see their own provider profile
  auth.uid() = user_id
  OR
  -- Users with active conversations see full provider data
  (
    status = 'approved'
    AND public.can_access_provider_contact(id)
  )
);

-- ============================================
-- ISSUE 3: Fix search_path for all functions
-- ============================================

-- Update all functions to have search_path set
CREATE OR REPLACE FUNCTION public.update_lojistas_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_product_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_conversation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    provider_user_id UUID;
    user_name TEXT;
BEGIN
    SELECT sp.user_id INTO provider_user_id
    FROM public.service_providers sp
    WHERE sp.id = NEW.service_provider_id;
    
    SELECT u.full_name INTO user_name
    FROM public.user_profiles u
    WHERE u.id = NEW.user_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        provider_user_id,
        'conversation_started',
        'Nova conversa iniciada',
        COALESCE(user_name, 'Um usuário') || ' iniciou uma conversa com você',
        jsonb_build_object(
            'conversation_id', NEW.id,
            'user_id', NEW.user_id
        )
    );
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    conversation_record RECORD;
    recipient_user_id UUID;
    sender_name TEXT;
BEGIN
    SELECT c.user_id, c.service_provider_id, sp.user_id as provider_user_id
    INTO conversation_record
    FROM public.conversations c
    LEFT JOIN public.service_providers sp ON sp.id = c.service_provider_id
    WHERE c.id = NEW.conversation_id;
    
    IF NEW.sender_type = 'user' THEN
        recipient_user_id := conversation_record.provider_user_id;
    ELSE
        recipient_user_id := conversation_record.user_id;
    END IF;
    
    SELECT u.full_name INTO sender_name
    FROM public.user_profiles u
    WHERE u.id = NEW.sender_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        recipient_user_id,
        'new_message',
        'Nova mensagem',
        COALESCE(sender_name, 'Alguém') || ' enviou uma mensagem',
        jsonb_build_object(
            'conversation_id', NEW.conversation_id,
            'message_id', NEW.id,
            'sender_id', NEW.sender_id
        )
    );
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_service_providers_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_service_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    provider_id UUID;
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        provider_id := OLD.service_provider_id;
    ELSE
        provider_id := NEW.service_provider_id;
    END IF;
    
    SELECT 
        COALESCE(AVG(rating), 0.0),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.service_provider_reviews
    WHERE service_provider_id = provider_id;
    
    UPDATE public.service_providers
    SET 
        rating = avg_rating,
        review_count = total_reviews,
        updated_at = NOW()
    WHERE id = provider_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_product_owner(product_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.store_owners so ON p.store_owner_id = so.id
    WHERE p.id = product_id AND so.id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_store_owner()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.store_owners 
    WHERE id = auth.uid() AND is_approved = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_product_expiration_30_days(product_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.products 
    SET expires_at = NOW() + INTERVAL '30 days'
    WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_expired_products()
RETURNS TABLE(id uuid, title text, user_id uuid, expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, p.user_id, p.expires_at
    FROM public.products p
    WHERE p.expires_at IS NOT NULL 
    AND p.expires_at < NOW()
    AND p.status = 'active';
END;
$$;

CREATE OR REPLACE FUNCTION public.deactivate_expired_products()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.products 
    SET status = 'inactive',
        updated_at = NOW()
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND status = 'active';
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')
  );
  RETURN NEW;
END;
$$;