-- Fix: Infinite recursion in users RLS policies
-- The original policies query public.users to check is_admin, 
-- which triggers the same policy again, causing infinite recursion.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;

-- Also fix orders/order_items policies that reference users table
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update all orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;

-- Fix products admin policy too
DROP POLICY IF EXISTS "Products are insertable/updatable by admins only" ON public.products;

-- ============================================
-- Create a secure function to check admin status
-- This avoids the recursive RLS problem
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- FIXED POLICIES
-- ============================================

-- Users: can view own profile, admins can view all
CREATE POLICY "Users view own profile" ON public.users 
  FOR SELECT USING (
    id = auth.uid() OR public.is_admin()
  );

-- Users: can update own profile
CREATE POLICY "Users update own profile" ON public.users 
  FOR UPDATE USING (id = auth.uid());

-- Users: allow insert for trigger (new user creation)
CREATE POLICY "Allow user creation via trigger" ON public.users
  FOR INSERT WITH CHECK (true);

-- Products: admins can CUD
CREATE POLICY "Products are manageable by admins only" ON public.products 
  FOR ALL USING (public.is_admin());

-- Orders: users see own, admins see all
CREATE POLICY "Users view own orders" ON public.orders 
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

-- Orders: admins can update all
CREATE POLICY "Admins update all orders" ON public.orders 
  FOR UPDATE USING (public.is_admin());

-- Order Items: follows orders access
CREATE POLICY "Users view own order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );
