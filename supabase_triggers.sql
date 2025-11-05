-- Trigger para crear automáticamente el registro en users_extension cuando se crea un usuario
-- ⚠️ IMPORTANTE: Ejecuta primero el SQL para crear la tabla users_extension del archivo supabase_setup_complete.sql

-- Primero verifica que la tabla existe
-- Si no existe, ejecuta: CREATE TABLE public.users_extension (...)
-- Ver el archivo supabase_setup_complete.sql para el SQL completo

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

-- Trigger que se ejecuta cuando se crea un nuevo usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS para users_extension
-- Permitir que los usuarios lean su propio perfil
CREATE POLICY "Users can read own profile"
  ON public.users_extension
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users_extension
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir que los usuarios inserten su propio perfil (por si acaso)
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

-- Habilitar RLS en la tabla
ALTER TABLE public.users_extension ENABLE ROW LEVEL SECURITY;

