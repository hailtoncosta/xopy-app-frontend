-- ============================================
-- PHASE 1: CREATE USER ROLES SYSTEM
-- ============================================

-- Create enum for roles (without IF NOT EXISTS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'service_provider');
    END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Create policy for users to view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- PHASE 2: CREATE SECURITY DEFINER FUNCTIONS
-- ============================================

-- Create has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update is_admin function to use has_role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- ============================================
-- PHASE 3: FIX SERVICE_PROVIDERS SECURITY
-- ============================================

-- Remove dangerous public access policy
DROP POLICY IF EXISTS "Allow public read access" ON public.service_providers;
DROP POLICY IF EXISTS "Prestadores aprovados são visíveis para todos" ON public.service_providers;

-- Create restricted policy for authenticated users to view approved providers
DROP POLICY IF EXISTS "Authenticated users can view approved providers" ON public.service_providers;
CREATE POLICY "Authenticated users can view approved providers"
ON public.service_providers
FOR SELECT
USING (
  status = 'approved' 
  AND auth.uid() IS NOT NULL
);

-- Policy for users to view their own full provider profile (already exists)
-- CREATE POLICY "Users view own provider profile" is redundant with existing policy

-- Admins can view all providers
DROP POLICY IF EXISTS "Admins can view all providers" ON public.service_providers;
CREATE POLICY "Admins can view all providers"
ON public.service_providers
FOR SELECT
USING (public.is_admin());

-- ============================================
-- PHASE 4: FIX PRODUCTS SECURITY (SELLER_INFO)
-- ============================================

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Produtos públicos são visíveis para todos" ON public.products;

-- Create policy for authenticated users to view products
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
CREATE POLICY "Authenticated users can view active products"
ON public.products
FOR SELECT
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
);

-- The policy "Users can view their own products" might already exist in another form
-- We'll create it if needed
DROP POLICY IF EXISTS "Users can view their own products full" ON public.products;
CREATE POLICY "Users can view their own products full"
ON public.products
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- PHASE 5: FIX ADMIN_SETTINGS SECURITY
-- ============================================

-- Remove public read access to admin settings
DROP POLICY IF EXISTS "Configurações públicas podem ser lidas" ON public.admin_settings;

-- Only admins can read admin_settings
DROP POLICY IF EXISTS "Only admins can read settings" ON public.admin_settings;
CREATE POLICY "Only admins can read settings"
ON public.admin_settings
FOR SELECT
USING (public.is_admin());

-- ============================================
-- PHASE 6: ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- PHASE 7: GRANT INITIAL ADMIN ROLE
-- ============================================

-- Insert admin role for existing admin users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('admin@pedreiro.com', 'enoquesanbor@gmail.com', 'admin@example.com')
ON CONFLICT (user_id, role) DO NOTHING;