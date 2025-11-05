-- Script para corregir triggers en order_items que intentan acceder a shipping_rate_id
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- 1. Verificar y eliminar triggers problemáticos en order_items
DO $$
BEGIN
  -- Eliminar triggers que puedan estar causando el problema
  DROP TRIGGER IF EXISTS order_items_calculate_subtotal ON public.order_items;
  DROP TRIGGER IF EXISTS order_items_update_order_total ON public.order_items;
  DROP TRIGGER IF EXISTS order_items_validate_shipping ON public.order_items;
  
  -- Eliminar funciones relacionadas
  DROP FUNCTION IF EXISTS public.calculate_order_total() CASCADE;
  DROP FUNCTION IF EXISTS public.validate_order_shipping() CASCADE;
END $$;

-- 2. Crear función para calcular subtotal en order_items (sin acceder a shipping_rate_id)
CREATE OR REPLACE FUNCTION public.calculate_order_item_subtotal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calcular subtotal basado solo en unit_price y quantity
  NEW.subtotal := NEW.unit_price * NEW.quantity;
  RETURN NEW;
END;
$$;

-- 3. Crear trigger para calcular subtotal en order_items
CREATE TRIGGER order_items_calculate_subtotal
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.calculate_order_item_subtotal();

-- 4. Crear función para actualizar total de la orden (sin acceder a shipping_rate_id desde NEW)
CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  order_record RECORD;
  new_subtotal NUMERIC := 0;
BEGIN
  -- Obtener la orden relacionada
  SELECT * INTO order_record
  FROM public.orders
  WHERE id = NEW.order_id;
  
  -- Calcular nuevo subtotal sumando todos los items
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO new_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;
  
  -- Actualizar la orden con el nuevo subtotal y total
  UPDATE public.orders
  SET 
    subtotal = new_subtotal,
    total = new_subtotal + COALESCE(shipping_cost, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$;

-- 5. Crear trigger para actualizar total de la orden después de insertar/actualizar items
CREATE TRIGGER order_items_update_order_total
AFTER INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_order_total();

-- 6. Crear trigger para actualizar total cuando se elimina un item
CREATE TRIGGER order_items_delete_update_order_total
AFTER DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_order_total();

-- Nota: Si el campo subtotal en order_items es una columna calculada (GENERATED ALWAYS AS),
-- no necesitas el trigger para calcular subtotal, solo el trigger para actualizar el total de la orden.

