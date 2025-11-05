-- Script rápido para corregir políticas RLS de categorías
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Verificar que la función is_admin existe (si no, crearla)
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

-- 2. Eliminar políticas existentes de categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;

-- 3. Crear política para lectura pública (MUY IMPORTANTE)
CREATE POLICY "Anyone can read categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- 4. Crear políticas para admins
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 5. Asegurar que RLS está habilitado
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;

-- 7. Verificar que la tabla existe y tiene datos
SELECT COUNT(*) as total_categories FROM public.categories;

-- Si no hay categorías, puedes insertar algunas de ejemplo:
-- INSERT INTO public.categories (name, slug) VALUES 
--   ('Categoría Ejemplo', 'categoria-ejemplo')
-- ON CONFLICT (slug) DO NOTHING;

