# Cambios Necesarios para el Esquema Real

## Diferencias Principales

### 1. users_extension
- ❌ **Antes**: `user_id` (FK a auth.users)
- ✅ **Ahora**: `id` (PK y FK a auth.users)
- ❌ **Antes**: `role` default 'customer'
- ✅ **Ahora**: `role` default 'cliente'
- ✅ Roles válidos: 'cliente', 'mayorista', 'admin'

### 2. Otras tablas que usan users_extension
- Todas las tablas que referencian `users_extension` usan `users_extension(id)` no `users_extension(user_id)`
- Ejemplos: `carts.user_id`, `orders.user_id`, `addresses.user_id`

### 3. Estructura de productos
- `product_images` usa `storage_path` no `image_url`
- `product_prices` tiene estructura diferente (id integer, no uuid)
- `categories` tiene jerarquía con `parent_id` (no subcategories separada)

### 4. Carritos y órdenes
- `cart_items` tiene `unit_price` y `subtotal` calculado
- `orders` tiene `payment_status` separado de `status`

## Archivos Actualizados

- ✅ `lib/auth.ts` - Usa `id` en lugar de `user_id`, rol por defecto 'cliente'
- ✅ `app/api/auth/create-profile/route.ts` - Usa `id` y rol 'cliente'
- ✅ `app/account/page.tsx` - Usa `id` en lugar de `user_id`
- ✅ `components/auth/AuthGuard.tsx` - Usa `id` en lugar de `user_id`
- ✅ `supabase_setup_real.sql` - Script SQL actualizado para el esquema real

## Archivos Pendientes de Actualizar

Necesitan cambios para usar `id` en lugar de `user_id` en referencias a `users_extension`:
- `app/account/orders/page.tsx`
- `app/account/addresses/page.tsx`
- `app/checkout/page.tsx`
- `app/cart/page.tsx`
- `components/cart/CartDrawer.tsx`
- `components/products/PriceDisplay.tsx`
- `lib/cart.ts`
- `lib/pricing.ts` - Roles: 'cliente', 'mayorista', 'admin'
- `components/checkout/CheckoutForm.tsx`
- `app/login/page.tsx`
- `components/layout/Navbar.tsx`

## Cambios de Roles

Cambiar todas las referencias de:
- `"customer"` → `"cliente"`
- `"wholesaler"` → `"mayorista"`
- `"admin"` → `"admin"` (sin cambios)


