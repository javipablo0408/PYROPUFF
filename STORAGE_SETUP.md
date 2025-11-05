# Configuración de Storage para Imágenes de Productos

## Crear el Bucket

1. Ve a **Storage** en tu dashboard de Supabase
2. Haz clic en **"New bucket"**
3. Configura:
   - **Name**: `products`
   - **Public bucket**: ✅ Habilitado (para que las imágenes sean accesibles públicamente)
   - Haz clic en **"Create bucket"**

## Configurar Políticas de Storage

Después de crear el bucket, necesitas configurar las políticas para que los admins puedan subir imágenes.

### Opción 1: Desde la UI de Supabase

1. Ve a **Storage** > **Policies** > **products**
2. Haz clic en **"New policy"** o **"Add policy"**
3. Crea estas políticas:

#### Política 1: Admins pueden subir imágenes

- **Policy name**: `Admins can upload images`
- **Allowed operation**: `INSERT`
- **Policy definition**:
```sql
(bucket_id = 'products'::text) AND (public.is_admin(auth.uid()))
```

#### Política 2: Admins pueden actualizar imágenes

- **Policy name**: `Admins can update images`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
```sql
(bucket_id = 'products'::text) AND (public.is_admin(auth.uid()))
```

#### Política 3: Admins pueden eliminar imágenes

- **Policy name**: `Admins can delete images`
- **Allowed operation**: `DELETE`
- **Policy definition**:
```sql
(bucket_id = 'products'::text) AND (public.is_admin(auth.uid()))
```

#### Política 4: Cualquiera puede leer imágenes

- **Policy name**: `Anyone can read images`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
(bucket_id = 'products'::text)
```

### Opción 2: Usando SQL (Más rápido)

Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Política para INSERT (subir imágenes)
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  public.is_admin(auth.uid())
);

-- Política para UPDATE (actualizar imágenes)
CREATE POLICY "Admins can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'products' AND
  public.is_admin(auth.uid())
);

-- Política para DELETE (eliminar imágenes)
CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  public.is_admin(auth.uid())
);

-- Política para SELECT (leer imágenes - público)
CREATE POLICY "Anyone can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');
```

## Verificar Configuración

### Verificar que el bucket existe:

```sql
SELECT * FROM storage.buckets WHERE name = 'products';
```

### Verificar las políticas:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%products%';
```

## Prueba de Subida

Después de configurar las políticas:

1. Ve al panel de administración: `http://localhost:3000/admin/products`
2. Intenta crear un producto nuevo
3. Sube algunas imágenes
4. Si todo funciona, verás las imágenes en el Storage de Supabase

## Solución de Problemas

### Error: "new row violates row-level security policy"

Asegúrate de:
1. ✅ Ejecutar `fix_admin_rls.sql` primero (para crear la función `is_admin()`)
2. ✅ Que tu usuario tenga rol `admin` en `users_extension`
3. ✅ Que las políticas de Storage estén configuradas

### Error: "Bucket not found"

1. Verifica que el bucket `products` existe en Storage
2. Verifica que el nombre sea exactamente `products` (sin espacios, minúsculas)

### Error: "Access denied"

1. Verifica que tu usuario esté autenticado
2. Verifica que tu usuario tenga rol `admin`
3. Verifica que las políticas de Storage estén creadas

## Notas Importantes

- El bucket debe ser **público** para que las imágenes se muestren en el sitio
- Las imágenes se almacenan en la ruta: `products/{productId}/{filename}`
- Solo los usuarios con rol `admin` pueden subir/eliminar imágenes
- Cualquier usuario puede leer las imágenes (necesario para mostrar productos)
