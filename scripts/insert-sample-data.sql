-- Script para insertar datos de ejemplo en la base de datos
-- Ejecutar después de que el usuario se haya logueado por primera vez

-- Ejemplo de registros de uso de API para demostrar funcionalidad
-- Reemplaza 'USER_ID_FROM_CLERK' con el ID real del usuario de Clerk

-- Insertar algunos registros de uso de API de ejemplo
INSERT INTO usage_records (user_id, api_key_id, model_used, input_tokens, output_tokens, cost, request_data, response_data, created_at)
VALUES 
  -- Ejemplo con GPT-4
  ('USER_ID_FROM_CLERK', 'api_key_example_1', 'gpt-4', 150, 300, 0.025, '{"prompt": "¿Cómo funciona la IA?"}', '{"response": "La inteligencia artificial..."}', NOW() - INTERVAL '2 hours'),
  
  -- Ejemplo con Claude
  ('USER_ID_FROM_CLERK', 'api_key_example_1', 'claude-3-sonnet', 200, 400, 0.030, '{"prompt": "Explica el machine learning"}', '{"response": "El machine learning es..."}', NOW() - INTERVAL '4 hours'),
  
  -- Ejemplo con GPT-3.5
  ('USER_ID_FROM_CLERK', 'api_key_example_1', 'gpt-3.5-turbo', 100, 250, 0.015, '{"prompt": "Resumen del proyecto"}', '{"response": "El proyecto consiste en..."}', NOW() - INTERVAL '1 day'),
  
  -- Más ejemplos para mostrar diferentes modelos
  ('USER_ID_FROM_CLERK', 'api_key_example_1', 'gpt-4', 180, 350, 0.028, '{"prompt": "Análisis de datos"}', '{"response": "Para el análisis de datos..."}', NOW() - INTERVAL '2 days'),
  
  ('USER_ID_FROM_CLERK', 'api_key_example_1', 'claude-3-haiku', 120, 200, 0.012, '{"prompt": "Código Python"}', '{"response": "```python\ndef ejemplo():..."}', NOW() - INTERVAL '3 days');

-- Insertar una API Key de ejemplo
INSERT INTO api_keys (user_id, name, key_value, is_active, created_at)
VALUES 
  ('USER_ID_FROM_CLERK', 'Clave Principal', 'rtr_' || substr(md5(random()::text), 1, 32), true, NOW() - INTERVAL '1 week');

-- Verificar los datos insertados
-- SELECT * FROM usage_records WHERE user_id = 'USER_ID_FROM_CLERK';
-- SELECT * FROM api_keys WHERE user_id = 'USER_ID_FROM_CLERK';

-- Para limpiar los datos de ejemplo (opcional):
-- DELETE FROM usage_records WHERE user_id = 'USER_ID_FROM_CLERK';
-- DELETE FROM api_keys WHERE user_id = 'USER_ID_FROM_CLERK' AND name = 'Clave Principal';