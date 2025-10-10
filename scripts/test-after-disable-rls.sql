-- Script de prueba después de deshabilitar RLS
-- Ejecutar DESPUÉS del script disable-rls-dev.sql

-- Probar insertar un usuario de prueba
INSERT INTO public.users (id, name, email, plan, is_active, email_verified) 
VALUES (
    'test_user_123',
    'Usuario de Prueba',
    'test@ejemplo.com',
    'free',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT id, name, email, plan, is_active, created_at 
FROM public.users 
WHERE id = 'test_user_123';

-- Insertar una API key de prueba
INSERT INTO public.api_keys (user_id, name, key_hash, is_active)
VALUES (
    'test_user_123',
    'Clave de Prueba',
    'rtr_test_key_123456789',
    true
) ON CONFLICT (key_hash) DO UPDATE SET
    name = EXCLUDED.name;

-- Verificar API key
SELECT id, user_id, name, key_hash, is_active, created_at
FROM public.api_keys
WHERE user_id = 'test_user_123';

-- Insertar algunos registros de uso de prueba
INSERT INTO public.usage_records (user_id, api_key_id, model_used, input_tokens, output_tokens, cost)
SELECT 
    'test_user_123',
    ak.id,
    'gpt-4',
    100,
    200,
    0.02
FROM public.api_keys ak
WHERE ak.user_id = 'test_user_123'
LIMIT 1;

-- Verificar registros de uso
SELECT ur.id, ur.model_used, ur.input_tokens, ur.output_tokens, ur.cost, ur.created_at
FROM public.usage_records ur
WHERE ur.user_id = 'test_user_123';

-- Estadísticas de prueba
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(cost) as total_cost
FROM public.usage_records;