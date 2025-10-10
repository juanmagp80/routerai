-- Script para deshabilitar RLS temporalmente durante desarrollo
-- SOLO para desarrollo - NO usar en producción

-- Deshabilitar RLS en todas las tablas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users full access to api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow authenticated users full access to usage_records" ON public.usage_records;

-- Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'api_keys', 'usage_records');