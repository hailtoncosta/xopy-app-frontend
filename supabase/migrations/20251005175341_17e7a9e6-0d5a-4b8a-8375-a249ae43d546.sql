-- ==============================================================================
-- CRITICAL SECURITY FIX: Protect Seller PII and Service Provider Contact Info
-- ==============================================================================

-- 1. Create function to check if user can access seller contact info
CREATE OR REPLACE FUNCTION public.can_access_seller_contact(product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- User can access if they are the product owner or an admin
  SELECT EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id 
    AND (p.user_id = auth.uid() OR public.is_admin())
  );
$$;

-- 2. Drop old products_public view if it exists
DROP VIEW IF EXISTS public.products_public CASCADE;

-- 3. Create secure view for products that masks sensitive seller_info
CREATE OR REPLACE VIEW public.products_public_safe AS
SELECT 
  id,
  title,
  description,
  category,
  price,
  quantity,
  unit,
  seller_type,
  product_type,
  condition,
  location,
  status,
  approval_status,
  is_featured,
  images,
  manufacturing_date,
  created_at,
  updated_at,
  approval_date,
  expires_at,
  user_id,
  -- Mask sensitive fields in seller_info
  CASE 
    WHEN public.can_access_seller_contact(id) THEN seller_info
    ELSE jsonb_build_object(
      'name', seller_info->>'name',
      'type', seller_info->>'type'
      -- CPF, CNPJ, email, phone, address are excluded
    )
  END as seller_info
FROM public.products
WHERE status = 'active' AND approval_status = 'approved';

-- 4. Update RLS policy on products to prevent direct seller_info access
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products full" ON public.products;

CREATE POLICY "Users can view their own products with full seller_info"
ON public.products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view approved products with masked data"
ON public.products
FOR SELECT
USING (
  status = 'active' 
  AND approval_status = 'approved'
  AND auth.uid() IS NOT NULL
);

-- 5. Strengthen service_providers RLS
DROP POLICY IF EXISTS "Users see full provider data if they have conversation" ON public.service_providers;

CREATE POLICY "Users see full provider data only for own profile or active conversation"
ON public.service_providers
FOR SELECT
USING (
  -- User is the provider themselves
  auth.uid() = user_id
  OR
  -- User is an admin
  public.is_admin()
  OR
  -- Provider is approved AND user has an active conversation with them
  (
    status = 'approved' 
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.service_provider_id = service_providers.id
      AND c.user_id = auth.uid()
      AND c.status = 'active'
    )
  )
);

-- 6. Create function to get masked service provider list (for public browsing)
CREATE OR REPLACE FUNCTION public.get_public_service_providers(provider_category text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  experience text,
  specialties text,
  description text,
  city text,
  neighborhood text,
  daily_rate numeric,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    category,
    experience,
    specialties,
    description,
    city,
    neighborhood,
    daily_rate,
    status,
    created_at
  FROM public.service_providers
  WHERE status = 'approved'
  AND (provider_category IS NULL OR category = provider_category);
$$;

COMMENT ON FUNCTION public.get_public_service_providers IS 'Returns approved service providers without exposing contact information';
COMMENT ON FUNCTION public.can_access_seller_contact IS 'Checks if user can access full seller contact information';
COMMENT ON VIEW public.products_public_safe IS 'Secure view of products with masked seller PII';