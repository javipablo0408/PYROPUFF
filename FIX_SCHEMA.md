# 🔧 Guía de Corrección del Esquema

## Paso 1: Ejecutar el SQL en Supabase

Ejecuta el contenido de `supabase_setup_real.sql` en el SQL Editor de Supabase:

```sql
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS
ALTER TABLE public.users_extension ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users_extension;

CREATE POLICY "Users can read own profile"
  ON public.users_extension
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users_extension
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users_extension
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.users_extension
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_extension
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Crear perfiles para usuarios existentes
INSERT INTO public.users_extension (id, role, first_name, last_name)
SELECT id, 'cliente', NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users_extension WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;
```

## Paso 2: Reiniciar la Aplicación

```bash
docker-compose restart
```

## Paso 3: Probar el Registro

1. Ve a `/register`
2. Regístrate con un nuevo usuario
3. Verifica en Supabase que se creó el registro en `users_extension`

## ✅ Verificación

Ejecuta este SQL para verificar:

```sql
-- Ver todos los perfiles
SELECT * FROM public.users_extension;

-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```


