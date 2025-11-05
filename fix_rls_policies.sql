-- ============================================
-- CORREGIR POLÍTICAS RLS - ELIMINAR RECURSIÓN INFINITA
-- ============================================
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Paso 1: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can read own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users_extension;

-- Paso 2: Crear una función helper para verificar si un usuario es admin
-- Esta función usa SECURITY DEFINER para evitar recursión
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users_extension
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Paso 3: Crear políticas RLS corregidas (sin recursión)

-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON public.users_extension
  FOR SELECT
  USING (auth.uid() = id);

-- Los administradores pueden leer todos los perfiles
-- Usa la función helper para evitar recursión
CREATE POLICY "Admins can read all profiles"
  ON public.users_extension
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users_extension
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.users_extension
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Paso 4: Verificar que las políticas están creadas
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
WHERE tablename = 'users_extension'
ORDER BY policyname;

-- Paso 5: Verificar que la función existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'is_admin';

