# Debug del Carrito Vacío

## Problema

El carrito se muestra vacío aunque se hayan agregado productos.

## Diagnóstico

### Paso 1: Verificar en la Consola del Navegador

1. Abre la consola del navegador (F12)
2. Abre el carrito
3. Busca estos logs:
   - `Cart ID: ...`
   - `Fetching cart items for cart_id: ...`
   - `Cart items (simple): ...`
   - `Error fetching simple cart items: ...`

### Paso 2: Verificar en Supabase

Ejecuta este SQL en el SQL Editor de Supabase para verificar los items del carrito:

```sql
-- Ver todos los carritos
SELECT id, user_id, guest_token, created_at 
FROM public.carts 
ORDER BY created_at DESC;

-- Ver todos los items del carrito
SELECT ci.*, c.user_id, c.guest_token 
FROM public.cart_items ci
JOIN public.carts c ON c.id = ci.cart_id
ORDER BY ci.created_at DESC;
```

### Paso 3: Verificar tu Carrito Específico

Si estás autenticado, ejecuta:

```sql
-- Reemplaza 'TU_USER_ID' con tu ID de usuario
SELECT ci.*, c.user_id 
FROM public.cart_items ci
JOIN public.carts c ON c.id = ci.cart_id
WHERE c.user_id = 'TU_USER_ID';
```

Si eres invitado, verifica el `guest_token` en localStorage y ejecuta:

```sql
-- Reemplaza 'TU_GUEST_TOKEN' con el token de localStorage
SELECT ci.*, c.guest_token 
FROM public.cart_items ci
JOIN public.carts c ON c.id = ci.cart_id
WHERE c.guest_token = 'TU_GUEST_TOKEN';
```

### Paso 4: Verificar Políticas RLS

Ejecuta este SQL para ver las políticas RLS de `cart_items`:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'cart_items'
ORDER BY policyname;
```

### Paso 5: Probar Lectura Directa

Ejecuta este SQL para probar si puedes leer los items (reemplaza con tu cart_id):

```sql
-- Verificar si puedes leer items directamente
SELECT * FROM public.cart_items 
WHERE cart_id = 'TU_CART_ID_AQUI';
```

## Solución Rápida

Si las políticas RLS no están configuradas, ejecuta el script `fix_cart_rls.sql` en Supabase.

## Problemas Comunes

### 1. El carrito se crea con un ID diferente

**Solución**: Verifica que el `cart_id` usado para insertar items sea el mismo que el usado para leer.

### 2. Políticas RLS bloquean la lectura

**Solución**: Ejecuta `fix_cart_rls.sql` para configurar las políticas correctamente.

### 3. El carrito es de invitado pero intentas leer como usuario autenticado

**Solución**: Verifica que el `guest_token` en localStorage coincida con el `guest_token` del carrito en la base de datos.

### 4. El carrito es de usuario pero intentas leer como invitado

**Solución**: Asegúrate de estar autenticado si el carrito tiene `user_id`.

