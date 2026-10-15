
-- 1. PRIVILEGE ESCALATION FIX: user_roles
DROP POLICY IF EXISTS "user_roles_insert_simple" ON public.user_roles;

CREATE POLICY "Only admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 2. RENTAL INQUIRIES: drop card columns (PCI-DSS)
ALTER TABLE public.rental_inquiries
  DROP COLUMN IF EXISTS card_number,
  DROP COLUMN IF EXISTS card_cvv,
  DROP COLUMN IF EXISTS card_holder,
  DROP COLUMN IF EXISTS card_expiry;

-- 3. NOTIFICATIONS: restrict INSERT
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;

CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. DYNAMIC BANNERS: admin-only writes
DROP POLICY IF EXISTS "authenticated_insert_banners" ON public.dynamic_banners;
DROP POLICY IF EXISTS "authenticated_update_banners" ON public.dynamic_banners;
DROP POLICY IF EXISTS "authenticated_delete_banners" ON public.dynamic_banners;

CREATE POLICY "Admins can insert banners"
ON public.dynamic_banners
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update banners"
ON public.dynamic_banners
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete banners"
ON public.dynamic_banners
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 5. DYNAMIC STORE DATA: use is_admin()
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_store_data;

CREATE POLICY "Admins can manage store data"
ON public.dynamic_store_data
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. USER PROFILES: remove broad SELECT, scope to conversation participants
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view profiles of conversation participants"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.service_providers sp_self ON sp_self.user_id = auth.uid()
    LEFT JOIN public.service_providers sp_other ON sp_other.user_id = user_profiles.id
    WHERE
      (
        (c.user_id = auth.uid() AND c.service_provider_id = sp_other.id)
        OR
        (c.service_provider_id = sp_self.id AND c.user_id = user_profiles.id)
      )
  )
);
