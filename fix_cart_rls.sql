-- Script para configurar políticas RLS para carritos
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Verificar que la función is_admin existe (si no, crearla)
-- Esta función debe existir antes de crear las políticas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM public.users_extension
        WHERE id = user_id
        AND role = 'admin'
      );
    END;
    $$;
  END IF;
END $$;

-- 2. Políticas para la tabla carts

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can create own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can update own carts" ON public.carts;
DROP POLICY IF EXISTS "Guests can read own carts" ON public.carts;
DROP POLICY IF EXISTS "Guests can create own carts" ON public.carts;
DROP POLICY IF EXISTS "Guests can update own carts" ON public.carts;

-- Usuarios autenticados pueden leer sus propios carritos
CREATE POLICY "Users can read own carts"
ON public.carts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Usuarios autenticados pueden crear sus propios carritos
CREATE POLICY "Users can create own carts"
ON public.carts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Usuarios autenticados pueden actualizar sus propios carritos
CREATE POLICY "Users can update own carts"
ON public.carts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Invitados pueden leer sus propios carritos (usando guest_token)
-- Nota: Necesitamos una función para verificar el guest_token
CREATE OR REPLACE FUNCTION public.get_guest_token()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- En el cliente, esto se maneja con localStorage
  -- Esta función solo existe para RLS
  RETURN NULL;
END;
$$;

-- Invitados pueden leer sus carritos
CREATE POLICY "Guests can read carts"
ON public.carts
FOR SELECT
TO anon
USING (guest_token IS NOT NULL);

-- Invitados pueden crear carritos
CREATE POLICY "Guests can create carts"
ON public.carts
FOR INSERT
TO anon
WITH CHECK (guest_token IS NOT NULL);

-- Invitados pueden actualizar sus carritos
CREATE POLICY "Guests can update carts"
ON public.carts
FOR UPDATE
TO anon
USING (guest_token IS NOT NULL)
WITH CHECK (guest_token IS NOT NULL);

-- 3. Políticas para la tabla cart_items

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read own cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can create own cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Guests can manage cart_items" ON public.cart_items;

-- Usuarios pueden leer items de sus propios carritos
-- Usamos la función is_admin para evitar problemas de recursión
CREATE POLICY "Users can read own cart_items"
ON public.cart_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (
      carts.user_id = auth.uid()
      OR public.is_admin(auth.uid())
    )
  )
);

-- Usuarios pueden crear items en sus propios carritos
CREATE POLICY "Users can create own cart_items"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- Usuarios pueden actualizar items en sus propios carritos
CREATE POLICY "Users can update own cart_items"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- Usuarios pueden eliminar items de sus propios carritos
CREATE POLICY "Users can delete own cart_items"
ON public.cart_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- Invitados pueden leer items de sus carritos
CREATE POLICY "Guests can read cart_items"
ON public.cart_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.guest_token IS NOT NULL
  )
);

-- Invitados pueden crear items en sus carritos
CREATE POLICY "Guests can create cart_items"
ON public.cart_items
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.guest_token IS NOT NULL
  )
);

-- Invitados pueden actualizar items en sus carritos
CREATE POLICY "Guests can update cart_items"
ON public.cart_items
FOR UPDATE
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.guest_token IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.guest_token IS NOT NULL
  )
);

-- Invitados pueden eliminar items de sus carritos
CREATE POLICY "Guests can delete cart_items"
ON public.cart_items
FOR DELETE
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.guest_token IS NOT NULL
  )
);

-- 4. Asegurar que RLS está habilitado
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('carts', 'cart_items')
ORDER BY tablename, policyname;

