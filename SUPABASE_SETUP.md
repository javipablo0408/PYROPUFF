# 🗄️ Configuración de Supabase - Pyro Puff

## ⚠️ IMPORTANTE: Ejecutar en este orden

### Paso 1: Crear la Tabla users_extension

Primero, ejecuta este SQL para crear la tabla:

```sql
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

CREATE INDEX IF NOT EXISTS idx_users_extension_user_id ON public.users_extension(user_id);
CREATE INDEX IF NOT EXISTS idx_users_extension_role ON public.users_extension(role);
```

### Paso 2: Ejecutar el Script Completo

Ejecuta el archivo `supabase_setup_complete.sql` completo en el SQL Editor de Supabase. Este script:

1. ✅ Crea la tabla `users_extension` (si no existe)
2. ✅ Crea la función y trigger para crear perfiles automáticamente
3. ✅ Configura las políticas RLS
4. ✅ Crea perfiles para usuarios existentes

### O ejecuta todo de una vez:

Copia y pega el contenido completo de `supabase_setup_complete.sql` en el SQL Editor de Supabase y ejecútalo.

## 🔍 Verificar que Funciona

### Verificar que la tabla existe:

```sql
SELECT * FROM public.users_extension;
```

### Verificar que el trigger existe:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Verificar las políticas RLS:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users_extension';
```

## 🔧 Solución de Problemas

### Error: "column user_id does not exist"

**Solución**: Esto significa que la tabla `users_extension` no existe o no tiene la columna `user_id`. 

1. Verifica que la tabla existe:
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users_extension';
```

2. Si no existe, ejecuta el SQL del Paso 1 primero.

3. Si existe pero no tiene `user_id`, verifica la estructura:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users_extension';
```

### Error: "trigger already exists"

**Solución**: El script elimina el trigger antes de crearlo, pero si persiste:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Luego ejecuta el script nuevamente.

### Error: "policy already exists"

**Solución**: El script elimina las políticas antes de crearlas, pero si persiste:

```sql
DROP POLICY IF EXISTS "Users can read own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_extension;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users_extension;
```

Luego ejecuta el script nuevamente.

## 📝 Crear Perfiles para Usuarios Existentes

Si ya tienes usuarios registrados sin perfil, ejecuta este SQL después de crear la tabla:

```sql
INSERT INTO public.users_extension (user_id, role)
SELECT id, 'customer'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.users_extension WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
```

## ✅ Checklist de Configuración

- [ ] Tabla `users_extension` creada
- [ ] Función `handle_new_user()` creada
- [ ] Trigger `on_auth_user_created` creado
- [ ] Políticas RLS configuradas
- [ ] RLS habilitado en la tabla
- [ ] Perfiles creados para usuarios existentes
- [ ] Verificado que funciona con un nuevo registro

## 🚀 Próximos Pasos

Una vez configurado correctamente:

1. Reinicia la aplicación: `docker-compose restart`
2. Prueba registrarte con un nuevo usuario
3. Verifica que el perfil se crea automáticamente en `users_extension`
