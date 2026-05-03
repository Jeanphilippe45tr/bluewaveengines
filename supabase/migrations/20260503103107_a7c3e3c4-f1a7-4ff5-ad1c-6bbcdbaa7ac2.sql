
-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND is_admin = true
  )
$$;

-- Revoke direct execute from public/anon/authenticated to prevent abuse
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated;
-- Grant only to authenticated since it's used in RLS
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a non-recursive replacement
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Also fix admin_settings policies that reference profiles
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;

CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix products policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix orders policies
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix receipts policies
DROP POLICY IF EXISTS "Admins can create receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts;

CREATE POLICY "Admins can create receipts"
ON public.receipts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own receipts"
ON public.receipts
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM orders WHERE orders.id = receipts.order_id AND orders.user_id = auth.uid()
  )
);
