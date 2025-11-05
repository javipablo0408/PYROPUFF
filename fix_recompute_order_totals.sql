-- Script para corregir la función fn_recompute_order_totals
-- Esta función está causando el error al intentar acceder a shipping_rate_id desde NEW
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Ver la definición actual de la función (para referencia)
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'fn_recompute_order_totals';

-- 2. Eliminar la función problemática
DROP FUNCTION IF EXISTS public.fn_recompute_order_totals() CASCADE;

-- 3. Crear una nueva función corregida que NO acceda a shipping_rate_id desde NEW
CREATE OR REPLACE FUNCTION public.fn_recompute_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  new_subtotal NUMERIC := 0;
  order_shipping_cost NUMERIC := 0;
  order_coupon_id UUID;
  discount_amount NUMERIC := 0;
  coupon_record RECORD;
BEGIN
  -- Obtener la orden relacionada usando el order_id del trigger
  -- Usamos COALESCE para manejar tanto INSERT (NEW.order_id) como DELETE (OLD.order_id)
  SELECT * INTO order_record
  FROM public.orders
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  -- Si no encontramos la orden, salir
  IF NOT FOUND THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Calcular nuevo subtotal sumando todos los items de la orden
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO new_subtotal
  FROM public.order_items
  WHERE order_id = order_record.id;
  
  -- Obtener el shipping_cost de la orden (no de shipping_rate_id)
  order_shipping_cost := COALESCE(order_record.shipping_cost, 0);
  
  -- Aplicar cupón si existe
  IF order_record.coupon_id IS NOT NULL THEN
    SELECT * INTO coupon_record
    FROM public.coupons
    WHERE id = order_record.coupon_id
      AND active = true
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (expires_at IS NULL OR expires_at >= NOW());
    
    IF FOUND THEN
      IF coupon_record.type = 'porcentaje' THEN
        discount_amount := new_subtotal * (coupon_record.value / 100);
      ELSIF coupon_record.type = 'fijo' THEN
        discount_amount := coupon_record.value;
      END IF;
      
      -- Asegurar que el descuento no exceda el subtotal
      IF discount_amount > new_subtotal THEN
        discount_amount := new_subtotal;
      END IF;
      
      new_subtotal := new_subtotal - discount_amount;
    END IF;
  END IF;
  
  -- Actualizar la orden con el nuevo subtotal y total
  -- El total = subtotal (después de descuentos) + shipping_cost
  UPDATE public.orders
  SET 
    subtotal = new_subtotal + discount_amount, -- subtotal antes del descuento
    total = new_subtotal + order_shipping_cost, -- total después de descuentos y envío
    updated_at = NOW()
  WHERE id = order_record.id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Verificar que el trigger existe y está correctamente configurado
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'order_items'
  AND trigger_name = 'trg_order_items_after_change';

-- Nota: Los otros dos triggers (increment/decrement stock) deberían estar bien
-- y no necesitan cambios a menos que también tengan problemas

