# 🔧 Solución de Problemas: Acceso al Panel Admin

## 🚨 Error de Recursión Infinita

Si ves este error:
```
"infinite recursion detected in policy for relation \"users_extension\""
```

**Solución inmediata:** Ejecuta el archivo `fix_rls_policies.sql` en el SQL Editor de Supabase.

Este script:
1. ✅ Elimina las políticas problemáticas
2. ✅ Crea una función helper para verificar admin (sin recursión)
3. ✅ Recrea las políticas RLS correctamente

## 🚀 Solución Rápida

### 1. Ve a la página de diagnóstico
```
http://localhost:3000/admin/debug
```

Esta página te mostrará:
- ✅ Tu ID de usuario
- ✅ Si tienes perfil en `users_extension`
- ✅ Tu rol actual
- ✅ El SQL exacto que necesitas ejecutar para hacerte admin

### 2. Si ves error de recursión infinita

Ejecuta `fix_rls_policies.sql` en Supabase SQL Editor, luego:

```sql
-- Verificar que las políticas están corregidas
SELECT * FROM pg_policies WHERE tablename = 'users_extension';

-- Crear o actualizar tu perfil
INSERT INTO public.users_extension (id, role, first_name, last_name)
VALUES ('TU_USER_ID', 'admin', 'Admin', 'User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 3. Si no tienes perfil o no eres admin

Ejecuta este SQL en el **SQL Editor de Supabase** (reemplaza `TU_USER_ID` con tu ID):

```sql
-- Opción 1: Si ya tienes perfil, solo actualiza el rol
UPDATE public.users_extension
SET role = 'admin'
WHERE id = 'TU_USER_ID';

-- Opción 2: Si no tienes perfil, créalo y hazlo admin
INSERT INTO public.users_extension (id, role, first_name, last_name)
VALUES ('TU_USER_ID', 'admin', 'Admin', 'User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 4. Verificar

```sql
-- Ver tu rol actual
SELECT 
  u.email,
  ue.role
FROM auth.users u
JOIN public.users_extension ue ON u.id = ue.id
WHERE u.email = 'tu-email@ejemplo.com';
```

## 🔍 Diagnóstico Paso a Paso

### Problema 1: "infinite recursion detected in policy"

**Causa:** Las políticas RLS están causando recursión infinita al verificar si un usuario es admin.

**Solución:**
1. Ejecuta `fix_rls_policies.sql` en Supabase
2. Esto crea una función `is_admin()` que evita la recursión
3. Reinicia la sesión (cierra sesión y vuelve a iniciar sesión)

### Problema 2: "No tienes acceso" o redirige a home

**Causa:** Tu usuario no tiene rol `'admin'` en la base de datos.

**Solución:**
1. Ve a `/admin/debug` para ver tu ID de usuario
2. Ejecuta el SQL para hacerte admin (ver arriba)
3. Reinicia la sesión (cierra sesión y vuelve a iniciar sesión)

### Problema 3: Error al leer perfil

**Causa:** 
- No tienes registro en `users_extension`
- Las políticas RLS están bloqueando el acceso

**Solución:**
1. Verifica que la tabla existe:
```sql
SELECT * FROM public.users_extension LIMIT 1;
```

2. Crea tu perfil:
```sql
INSERT INTO public.users_extension (id, role)
VALUES ('TU_USER_ID', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

3. Verifica las políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users_extension';
```

4. Si las políticas no existen o hay errores, ejecuta `fix_rls_policies.sql`

### Problema 4: El usuario no se crea automáticamente

**Causa:** El trigger no está funcionando.

**Solución:**
1. Verifica que el trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Si no existe, ejecuta `supabase_setup_real.sql` completo

3. O crea el perfil manualmente (ver Problema 3)

## 📋 Checklist de Verificación

- [ ] He ejecutado `fix_rls_policies.sql` si había error de recursión
- [ ] Estoy logueado en la aplicación
- [ ] Tengo un registro en `users_extension`
- [ ] Mi rol es `'admin'` (no `'cliente'` o `'mayorista'`)
- [ ] Las políticas RLS están configuradas correctamente
- [ ] El trigger está funcionando
- [ ] He cerrado sesión y vuelto a iniciar sesión después de cambiar el rol

## 🔄 Reiniciar Después de Cambios

Después de cambiar tu rol en la base de datos o corregir las políticas:

1. **Cierra sesión** en la aplicación
2. **Inicia sesión** nuevamente
3. Ve a `/admin` o `/admin/debug`

## 💡 Tips

- Usa `/admin/debug` siempre para diagnosticar problemas
- El SQL exacto que necesitas está en la página de diagnóstico
- Asegúrate de usar el ID correcto (UUID) del usuario
- Los cambios en la base de datos requieren cerrar sesión y volver a iniciar
- Si ves recursión infinita, ejecuta `fix_rls_policies.sql` primero

## 🆘 Si Nada Funciona

1. Verifica los logs del servidor:
```bash
docker-compose logs -f app
```

2. Verifica la consola del navegador (F12)

3. Verifica que las variables de entorno están configuradas:
```bash
docker-compose exec app env | grep SUPABASE
```

4. Reinicia el contenedor:
```bash
docker-compose restart
```

5. Verifica que la función `is_admin` existe:
```sql
SELECT * FROM information_schema.routines 
WHERE routine_name = 'is_admin';
```
