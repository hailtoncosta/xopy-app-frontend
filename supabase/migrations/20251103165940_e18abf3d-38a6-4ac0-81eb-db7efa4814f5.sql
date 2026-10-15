-- SECURITY IMPROVEMENTS: Restrict access to sensitive settings and admin data

-- 1. FIX: Restrict platform_settings to admin-only
-- Drop public read policy
DROP POLICY IF EXISTS "Todos podem ler configurações da plataforma" ON platform_settings;

-- Create admin-only read policy
CREATE POLICY "Admins can read platform settings"
ON platform_settings
FOR SELECT
TO authenticated
USING (is_admin());

-- 2. FIX: Restrict admin_settings to admin-only
-- Drop public read policy
DROP POLICY IF EXISTS "Todos podem ler configurações" ON admin_settings;

-- Create admin-only read policy
CREATE POLICY "Admins can read admin settings"
ON admin_settings
FOR SELECT
TO authenticated
USING (is_admin());