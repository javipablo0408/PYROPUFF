# Solución de Error RLS para Panel de Administración

## Problema

Error: `new row violates row-level security policy`

Este error ocurre cuando intentas crear o editar productos en el panel de administración porque las políticas RLS (Row Level Security) de Supabase están bloqueando la operación.

## Solución

### Paso 1: Ejecutar el Script SQL

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `fix_admin_rls.sql`
3. Ejecuta el script

Este script:
- ✅ Crea la función `is_admin()` para verificar si un usuario es admin
- ✅ Configura políticas RLS para `products` (permite a admins crear/editar/eliminar)
- ✅ Configura políticas RLS para `product_images` (permite a admins subir/eliminar imágenes)
- ✅ Configura políticas RLS para `categories` (permite a admins gestionar categorías)
- ✅ Configura políticas RLS para `product_prices` (permite a admins gestionar precios)

### Paso 2: Verificar que Eres Admin

Asegúrate de que tu usuario tenga el rol `admin`:

```sql
-- Verificar tu rol
SELECT id, role, first_name, last_name 
FROM public.users_extension 
WHERE id = auth.uid();

-- Si no eres admin, actualiza tu rol:
UPDATE public.users_extension
SET role = 'admin'
WHERE id = auth.uid();
```

### Paso 3: Verificar Políticas RLS

Verifica que las políticas estén creadas:

```sql
-- Ver políticas de products
SELECT * FROM pg_policies 
WHERE tablename = 'products';

-- Ver políticas de product_images
SELECT * FROM pg_policies 
WHERE tablename = 'product_images';

-- Ver políticas de categories
SELECT * FROM pg_policies 
WHERE tablename = 'categories';
```

## Explicación de las Políticas

### Para Administradores

Las siguientes operaciones están permitidas SOLO para usuarios con rol `admin`:

- **INSERT**: Crear nuevos productos, imágenes, categorías, precios
- **UPDATE**: Editar productos existentes, imágenes, categorías, precios
- **DELETE**: Eliminar productos, imágenes, categorías, precios

### Para Usuarios Públicos

- **SELECT**: Cualquier usuario (autenticado o no) puede leer productos activos, imágenes y categorías

## Solución Alternativa (Temporal)

Si necesitas una solución temporal mientras configuras las políticas, puedes:

1. Deshabilitar temporalmente RLS en la tabla (NO recomendado para producción):

```sql
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
```

⚠️ **ADVERTENCIA**: Esto desactiva toda la seguridad. Solo úsalo para desarrollo local.

## Verificación

Después de ejecutar el script, intenta:

1. Crear un nuevo producto en el panel admin
2. Subir imágenes para ese producto
3. Editar el producto
4. Eliminar el producto

Si todo funciona correctamente, las políticas RLS están configuradas correctamente.

## Problemas Comunes

### "function is_admin does not exist"

Ejecuta primero la parte del script que crea la función `is_admin()`.

### "permission denied for table products"

Asegúrate de que:
1. El usuario está autenticado
2. El usuario tiene rol `admin` en `users_extension`
3. Las políticas RLS están creadas y habilitadas

### "policy already exists"

Si recibes este error, primero elimina las políticas existentes ejecutando los comandos `DROP POLICY` al inicio del script.

## Soporte

Si después de seguir estos pasos sigues teniendo problemas:

1. Verifica que tu usuario tiene rol `admin`
2. Verifica que RLS está habilitado: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
3. Revisa los logs de Supabase para ver qué política específica está fallando
