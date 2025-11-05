# 👨‍💼 Crear Usuario Administrador

## Método 1: Usando SQL en Supabase (Recomendado)

### Paso 1: Obtener el ID del usuario

Primero, necesitas el ID del usuario en `auth.users`. Puedes obtenerlo de dos formas:

**Opción A: Desde la aplicación (una vez que te registres)**
1. Inicia sesión en la aplicación
2. Abre la consola del navegador (F12)
3. Ejecuta: `await supabase.auth.getUser()` y copia el `id`

**Opción B: Desde Supabase Dashboard**
1. Ve a **Authentication** > **Users**
2. Encuentra tu usuario
3. Copia el **User UID**

### Paso 2: Actualizar el rol en la base de datos

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Reemplaza 'TU_USER_ID_AQUI' con el ID real del usuario
UPDATE public.users_extension
SET role = 'admin'
WHERE id = 'TU_USER_ID_AQUI';
```

### Paso 3: Verificar

Ejecuta este SQL para verificar:

```sql
SELECT id, role, first_name, last_name 
FROM public.users_extension 
WHERE role = 'admin';
```

## Método 2: Crear un usuario admin directamente

Si quieres crear un usuario admin desde cero:

### Paso 1: Crear usuario en Supabase Auth

1. Ve a **Authentication** > **Users**
2. Haz clic en **Add user** > **Create new user**
3. Ingresa email y contraseña
4. Copia el **User UID** que se genera

### Paso 2: Crear el perfil admin

Ejecuta este SQL (reemplaza los valores):

```sql
INSERT INTO public.users_extension (id, role, first_name, last_name)
VALUES (
  'USER_ID_AQUI',  -- ID del usuario de auth.users
  'admin',
  'Admin',         -- Nombre
  'User'           -- Apellido
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

## Método 3: Desde la aplicación (si tienes acceso)

Si ya tienes un usuario admin, puedes crear otros desde el panel admin cuando esté implementado.

## 🔐 Acceder al Panel Admin

Una vez que tu usuario tenga el rol `admin`:

1. Inicia sesión en la aplicación con ese usuario
2. Ve a: `http://localhost:3000/admin`
3. Deberías ver el panel de administración

## ⚠️ Verificar que funciona

Si no puedes acceder, verifica:

1. **Que el usuario tenga rol 'admin'**:
```sql
SELECT id, role FROM public.users_extension WHERE id = 'TU_USER_ID';
```

2. **Que las políticas RLS permitan acceso** (debería estar configurado en `supabase_setup_real.sql`)

3. **Revisa la consola del navegador** por errores

## 🚀 Script SQL Rápido

```sql
-- Ver todos los usuarios y sus roles
SELECT 
  u.id,
  u.email,
  ue.role,
  ue.first_name,
  ue.last_name
FROM auth.users u
LEFT JOIN public.users_extension ue ON u.id = ue.id;

-- Hacer admin al primer usuario (ajusta según necesites)
UPDATE public.users_extension
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
```


