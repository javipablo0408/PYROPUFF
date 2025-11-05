# 🔐 Acceso al Panel de Administración

## Cómo Acceder

### Paso 1: Crear un Usuario Administrador

Necesitas tener un usuario con rol `'admin'` en la tabla `users_extension`.

**Opción Rápida - Usar SQL:**

1. Ve al **SQL Editor** en Supabase
2. Ejecuta este SQL (reemplaza `TU_USER_ID` con tu ID de usuario):

```sql
-- Primero, verifica tu ID de usuario
SELECT id, email FROM auth.users;

-- Luego, actualiza el rol a admin
UPDATE public.users_extension
SET role = 'admin'
WHERE id = 'TU_USER_ID_AQUI';
```

**O haz admin al primer usuario registrado:**

```sql
UPDATE public.users_extension
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
```

### Paso 2: Iniciar Sesión

1. Ve a `http://localhost:3000/login`
2. Inicia sesión con el usuario que tiene rol `admin`
3. Serás redirigido automáticamente a `/admin`

### Paso 3: Acceder al Panel

Una vez logueado como admin, puedes acceder a:

- `http://localhost:3000/admin` - Panel principal
- Desde ahí podrás gestionar productos, pedidos, clientes, etc.

## 🔍 Verificar Rol de Usuario

Para verificar el rol de un usuario:

```sql
SELECT 
  u.email,
  ue.role,
  ue.first_name,
  ue.last_name
FROM auth.users u
LEFT JOIN public.users_extension ue ON u.id = ue.id
WHERE u.email = 'tu-email@ejemplo.com';
```

## ⚠️ Solución de Problemas

### "No tienes permisos" o redirige a home

1. Verifica que el usuario tenga rol `'admin'`:
```sql
SELECT role FROM public.users_extension WHERE id = 'TU_USER_ID';
```

2. Verifica que las políticas RLS estén configuradas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users_extension';
```

3. Reinicia la aplicación:
```bash
docker-compose restart
```

### El usuario no tiene perfil

Si el usuario no tiene registro en `users_extension`, créalo:

```sql
INSERT INTO public.users_extension (id, role, first_name, last_name)
VALUES (
  'TU_USER_ID',
  'admin',
  'Admin',
  'User'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

## 📝 Roles Disponibles

- `'cliente'` - Cliente normal (por defecto)
- `'mayorista'` - Mayorista (precios especiales)
- `'admin'` - Administrador (acceso completo al panel)

## 🚀 Script Todo-en-Uno

Ejecuta este SQL para:
1. Ver todos los usuarios
2. Hacer admin al primer usuario
3. Verificar el resultado

```sql
-- Ver todos los usuarios
SELECT 
  u.id,
  u.email,
  ue.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.users_extension ue ON u.id = ue.id
ORDER BY u.created_at;

-- Hacer admin al primer usuario (ajusta según necesites)
UPDATE public.users_extension
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE id IN (SELECT id FROM public.users_extension)
  ORDER BY created_at 
  LIMIT 1
);

-- Verificar
SELECT 
  u.email,
  ue.role
FROM auth.users u
JOIN public.users_extension ue ON u.id = ue.id
WHERE ue.role = 'admin';
```


