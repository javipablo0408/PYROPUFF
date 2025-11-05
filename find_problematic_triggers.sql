-- Script para encontrar todos los triggers y funciones en order_items
-- Ejecuta esto en el SQL Editor de Supabase para diagnosticar el problema

-- 1. Ver todos los triggers en order_items
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'order_items'
ORDER BY trigger_name;

-- 2. Ver todas las funciones que podrían estar relacionadas
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_definition LIKE '%order_items%' 
    OR routine_definition LIKE '%shipping_rate_id%'
    OR routine_definition LIKE '%NEW.shipping_rate_id%'
  )
ORDER BY routine_name;

-- 3. Ver todas las funciones y triggers en order_items usando pg_catalog
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'order_items'
  AND t.tgisinternal = false
ORDER BY t.tgname;

