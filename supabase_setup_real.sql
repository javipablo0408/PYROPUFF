-- Script de configuración para la base de datos REAL de Pyro Puff
-- Ejecuta este SQL en el SQL Editor de Supabase

-- ============================================
-- 1. VERIFICAR QUE LA TABLA users_extension EXISTE
-- ============================================

-- La tabla users_extension ya existe con esta estructura:
-- id uuid (PK, FK a auth.users(id))
-- role text DEFAULT 'cliente'
-- first_name text
-- last_name text
-- phone text
-- birth_date date
-- created_at timestamp

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
  INSERT INTO public.users_extension (id, role, first_name, last_name)
  VALUES (NEW.id, 'cliente', NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
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
-- 3. CREAR FUNCIÓN HELPER PARA VERIFICAR ADMIN
-- ============================================
-- Esta función evita recursión infinita en las políticas RLS

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

-- ============================================
-- 4. CONFIGURAR POLÍTICAS RLS (SIN RECURSIÓN)
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
  USING (auth.uid() = id);

-- Los administradores pueden leer todos los perfiles
-- Usa la función helper para evitar recursión
CREATE POLICY "Admins can read all profiles"
  ON public.users_extension
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users_extension
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.users_extension
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. CREAR PERFILES PARA USUARIOS EXISTENTES
-- ============================================

INSERT INTO public.users_extension (id, role, first_name, last_name)
SELECT id, 'cliente', NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users_extension WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;
