-- Script para insertar datos de ejemplo después del primer login
-- Ejecutar DESPUÉS de que el usuario se haya logueado por primera vez
-- Reemplaza 'YOUR_CLERK_USER_ID' con tu ID real de Clerk

-- PASO 1: Verificar que el usuario existe
SELECT id, name, email FROM public.users LIMIT 5;

-- PASO 2: Insertar una API key de ejemplo (ajusta el user_id)
INSERT INTO public.api_keys (user_id, name, key_hash, is_active) 
VALUES (
    'YOUR_CLERK_USER_ID', -- Reemplaza con tu ID de Clerk
    'Clave Principal', 
    'rtr_' || substr(md5(random()::text), 1, 32), 
    true
);

-- PASO 3: Obtener el ID de la API key recién creada
SELECT id, user_id, name FROM public.api_keys WHERE user_id = 'YOUR_CLERK_USER_ID';

-- PASO 4: Insertar algunos registros de uso de ejemplo
-- Reemplaza 'YOUR_CLERK_USER_ID' y 'YOUR_API_KEY_ID' con los valores reales
INSERT INTO public.usage_records (user_id, api_key_id, model_used, input_tokens, output_tokens, cost, request_data, response_data, created_at)
VALUES 
  -- Ejemplo con GPT-4
  ('YOUR_CLERK_USER_ID', 'YOUR_API_KEY_ID', 'gpt-4', 150, 300, 0.025, '{"prompt": "¿Cómo funciona la IA?"}', '{"response": "La inteligencia artificial..."}', NOW() - INTERVAL '2 hours'),
  
  -- Ejemplo con Claude
  ('YOUR_CLERK_USER_ID', 'YOUR_API_KEY_ID', 'claude-3-sonnet', 200, 400, 0.030, '{"prompt": "Explica el machine learning"}', '{"response": "El machine learning es..."}', NOW() - INTERVAL '4 hours'),
  
  -- Ejemplo con GPT-3.5
  ('YOUR_CLERK_USER_ID', 'YOUR_API_KEY_ID', 'gpt-3.5-turbo', 100, 250, 0.015, '{"prompt": "Resumen del proyecto"}', '{"response": "El proyecto consiste en..."}', NOW() - INTERVAL '1 day'),
  
  -- Más ejemplos para mostrar diferentes modelos
  ('YOUR_CLERK_USER_ID', 'YOUR_API_KEY_ID', 'gpt-4', 180, 350, 0.028, '{"prompt": "Análisis de datos"}', '{"response": "Para el análisis de datos..."}', NOW() - INTERVAL '2 days'),
  
  ('YOUR_CLERK_USER_ID', 'YOUR_API_KEY_ID', 'claude-3-haiku', 120, 200, 0.012, '{"prompt": "Código Python"}', '{"response": "```python\ndef ejemplo():..."}', NOW() - INTERVAL '3 days');

-- PASO 5: Verificar los datos insertados
SELECT 
    ur.model_used,
    ur.input_tokens,
    ur.output_tokens,
    ur.cost,
    ur.created_at
FROM public.usage_records ur
WHERE ur.user_id = 'YOUR_CLERK_USER_ID'
ORDER BY ur.created_at DESC;

-- PASO 6: Verificar estadísticas totales
SELECT 
    COUNT(*) as total_calls,
    SUM(cost) as total_cost,
    AVG(output_tokens::float / 1000) as avg_response_time,
    COUNT(DISTINCT model_used) as models_used
FROM public.usage_records 
WHERE user_id = 'YOUR_CLERK_USER_ID';