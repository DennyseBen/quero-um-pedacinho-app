-- Add ticket_code and pickup_mode to orders
ALTER TABLE public.orders ADD COLUMN ticket_code TEXT;
ALTER TABLE public.orders ADD COLUMN pickup_mode TEXT DEFAULT 'balcao';

-- Make user_id nullable to allow anonymous orders (mobile app express flow)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Drop previous strict RLS policies for orders and order_items that forced user_id = auth.uid()
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;

-- New policies for orders
-- Anyone can insert an order (so mobile can insert without auth)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

-- For viewing:
-- Admins can view all orders
-- Non-admins can view orders if they own them (user_id = auth.uid()) OR if it's an anonymous order (user_id IS NULL)
CREATE POLICY "Users view own or anon orders" ON public.orders FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- New policies for order_items
-- Anyone can insert order items
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Anyone can view order items (or we could restrict to own/anon orders)
CREATE POLICY "Users view own or anon order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
  )
);
