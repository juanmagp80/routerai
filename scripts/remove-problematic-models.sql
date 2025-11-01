-- Script para remover modelos problemáticos de los planes
-- Estos modelos requieren acceso especial o no están disponibles

UPDATE plan_limits 
SET allowed_models = array_remove(array_remove(allowed_models, 'o1-preview'), 'o1-mini')
WHERE 'o1-preview' = ANY(allowed_models) OR 'o1-mini' = ANY(allowed_models);

UPDATE plan_limits 
SET allowed_models = array_remove(allowed_models, 'gemini-ultra')
WHERE 'gemini-ultra' = ANY(allowed_models);

-- Verificar los cambios
SELECT plan_name, allowed_models 
FROM plan_limits 
ORDER BY plan_name;