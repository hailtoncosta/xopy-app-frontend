-- CRITICAL SECURITY FIX: Enable RLS and Fix Permissive Policies
-- This migration addresses 3 critical security issues

-- 1. ENABLE RLS ON PRODUCTS TABLE
-- Currently RLS is disabled despite having policies defined
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. FIX OVERLY PERMISSIVE USER_PROFILES POLICY
-- Current policy "Admin can read all user profiles" uses USING (true)
-- This allows ANY authenticated user to read ALL profiles
DROP POLICY IF EXISTS "Admin can read all user profiles" ON user_profiles;

-- Create correct admin-only policy using is_admin() function
CREATE POLICY "Admins can read all profiles" 
ON user_profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- 3. ENSURE USER_PROFILES RLS IS ENABLED (should already be, but verify)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify the changes
DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied:';
  RAISE NOTICE '   - RLS enabled on products table';
  RAISE NOTICE '   - User profiles policy restricted to admins only';
  RAISE NOTICE '   - Only users with admin role in user_roles table can access all profiles';
END $$;