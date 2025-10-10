-- Script para analizar la estructura actual de la base de datos
-- Ejecuta estas consultas en Supabase SQL Editor para ver qué tienes

-- 1. Ver todas las tablas existentes
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Ver la estructura de la tabla users (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver todos los índices en la tabla users
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 4. Ver las constraints/restricciones de la tabla users
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
  AND tc.table_schema = 'public';

-- 5. Ver si existen las otras tablas que necesitamos
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') 
        THEN 'api_keys EXISTS' 
        ELSE 'api_keys MISSING' 
    END as api_keys_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_records') 
        THEN 'usage_records EXISTS' 
        ELSE 'usage_records MISSING' 
    END as usage_records_status;

-- 6. Ver algunos datos de ejemplo de users (si existe)
-- Descomenta la siguiente línea si quieres ver los datos actuales
-- SELECT id, name, email FROM users LIMIT 5;