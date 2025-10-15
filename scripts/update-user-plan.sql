-- SCRIPT PARA ACTUALIZAR PLAN DE USUARIO
-- Ejecutar en Supabase SQL Editor

-- Verificar datos actuales del usuario
SELECT clerk_user_id, email, current_plan, plan, created_at 
FROM users 
WHERE email = 'tu-email@ejemplo.com'; -- Reemplazar con tu email real

-- Actualizar plan a STARTER para el usuario específico
UPDATE users 
SET current_plan = 'starter',
    plan = 'starter',
    updated_at = NOW()
WHERE email = 'tu-email@ejemplo.com'; -- Reemplazar con tu email real

-- Verificar que el cambio se aplicó correctamente
SELECT clerk_user_id, email, current_plan, plan, updated_at 
FROM users 
WHERE email = 'tu-email@ejemplo.com'; -- Reemplazar con tu email real

-- También verificar que existen los límites del plan STARTER
SELECT * FROM plan_limits WHERE plan_name = 'starter';

-- Si no existe, crear los límites para el plan STARTER
INSERT INTO plan_limits (plan_name, monthly_request_limit, api_key_limit, features)
VALUES ('starter', 10000, 10, '{"priority_support": true, "advanced_analytics": true}')
ON CONFLICT (plan_name) DO UPDATE SET
    monthly_request_limit = 10000,
    api_key_limit = 10,
    features = '{"priority_support": true, "advanced_analytics": true}';

-- Confirmación final
SELECT 'Plan actualizado exitosamente' as resultado;