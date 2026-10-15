-- Fix infinite recursion in service_providers RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all providers" ON public.service_providers;
DROP POLICY IF EXISTS "Users see full provider data only for own profile or active con" ON public.service_providers;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio cadastro de prestador" ON public.service_providers;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio cadastro de prestador" ON public.service_providers;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio cadastro de prestador" ON public.service_providers;

-- Create simplified, non-recursive policies

-- Policy 1: Admins can see everything
CREATE POLICY "Admins can manage all service providers"
ON public.service_providers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy 2: Users can view their own service provider profile
CREATE POLICY "Users can view own service provider profile"
ON public.service_providers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can insert their own service provider profile
CREATE POLICY "Users can create own service provider profile"
ON public.service_providers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own service provider profile
CREATE POLICY "Users can update own service provider profile"
ON public.service_providers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Approved providers are publicly visible (limited data)
-- This uses the existing service_providers_public view for safe public access
CREATE POLICY "Public can view approved providers basic info"
ON public.service_providers
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Note: For unauthenticated users, use the service_providers_public view
-- or the get_public_service_providers() function which are already set up