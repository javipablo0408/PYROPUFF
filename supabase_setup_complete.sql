-- Script completo de configuración de Supabase para Pyro Puff
-- Ejecuta este SQL en el SQL Editor de Supabase

-- ============================================
-- 1. CREAR LA TABLA users_extension
-- ============================================

CREATE TABLE IF NOT EXISTS public.users_extension (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'wholesaler', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_users_extension_user_id ON public.users_extension(user_id);
CREATE INDEX IF NOT EXISTS idx_users_extension_role ON public.users_extension(role);

-- ============================================
-- 2. CREAR LA FUNCIÓN Y TRIGGER
-- ============================================

-- Función para crear el perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users_extension (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Eliminar el trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. CONFIGURAR POLÍTICAS RLS
-- ============================================

-- Habilitar RLS
ALTER TABLE public.users_extension ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can read own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users_extension;

-- Permitir que los usuarios lean su propio perfil
CREATE POLICY "Users can read own profile"
  ON public.users_extension
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users_extension
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.users_extension
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
  ON public.users_extension
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_extension
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. CREAR PERFILES PARA USUARIOS EXISTENTES
-- ============================================

-- Crear perfiles para usuarios existentes que no tienen perfil
INSERT INTO public.users_extension (user_id, role)
SELECT id, 'customer'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.users_extension WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 5. VERIFICAR CONFIGURACIÓN
-- ============================================

-- Verificar que la tabla existe
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users_extension'
ORDER BY ordinal_position;

-- Verificar que el trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar políticas RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename = 'users_extension';


