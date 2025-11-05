-- Script para configurar políticas RLS para el panel de administración
-- Permite a usuarios admin hacer todas las operaciones en productos e imágenes

-- 1. Función helper para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users_extension
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$;

-- 2. Políticas para la tabla products

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;

-- Permite a los admins insertar productos
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins actualizar productos
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins eliminar productos
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Permite a cualquiera leer productos activos
CREATE POLICY "Anyone can read active products"
ON public.products
FOR SELECT
TO public
USING (active = true);

-- 3. Políticas para la tabla product_images

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can delete product_images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can read product_images" ON public.product_images;

-- Permite a los admins insertar imágenes
CREATE POLICY "Admins can insert product_images"
ON public.product_images
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins actualizar imágenes
CREATE POLICY "Admins can update product_images"
ON public.product_images
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins eliminar imágenes
CREATE POLICY "Admins can delete product_images"
ON public.product_images
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Permite a cualquiera leer imágenes
CREATE POLICY "Anyone can read product_images"
ON public.product_images
FOR SELECT
TO public
USING (true);

-- 4. Políticas para la tabla categories (si no existen)

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;

-- Permite a los admins insertar categorías
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins actualizar categorías
CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Permite a los admins eliminar categorías
CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Permite a cualquiera leer categorías
CREATE POLICY "Anyone can read categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- 5. Verificar que RLS esté habilitado en las tablas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. Políticas para product_prices (si se necesitan para el admin)

DROP POLICY IF EXISTS "Admins can insert product_prices" ON public.product_prices;
DROP POLICY IF EXISTS "Admins can update product_prices" ON public.product_prices;
DROP POLICY IF EXISTS "Admins can delete product_prices" ON public.product_prices;
DROP POLICY IF EXISTS "Anyone can read product_prices" ON public.product_prices;

CREATE POLICY "Admins can insert product_prices"
ON public.product_prices
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product_prices"
ON public.product_prices
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product_prices"
ON public.product_prices
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can read product_prices"
ON public.product_prices
FOR SELECT
TO public
USING (true);

ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para Storage (bucket 'products')

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;

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

-- NOTA: Asegúrate de crear el bucket 'products' en Storage antes de ejecutar estas políticas
-- Ver STORAGE_SETUP.md para más detalles
