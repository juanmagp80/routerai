-- Script para actualizar la estructura de la base de datos con límites de planes
-- Ejecutar después de crear las tablas plan_limits

-- Actualizar tu usuario con los nuevos campos
UPDATE public.users 
SET 
    monthly_requests_used = 0,
    last_reset_date = CURRENT_DATE,
    free_trial_expires_at = NULL  -- Como ya tienes datos reales, no aplicar límite de tiempo
WHERE id = 'user_33q1Kg1FwUFIlUtpd63FDACofcl';

-- Verificar la actualización
SELECT 
    id,
    name,
    email,
    plan,
    api_key_limit,
    monthly_requests_used,
    last_reset_date,
    free_trial_expires_at,
    is_active
FROM public.users 
WHERE id = 'user_33q1Kg1FwUFIlUtpd63FDACofcl';

-- Verificar que las configuraciones de planes están correctas
SELECT 
    plan_name,
    monthly_request_limit as "Requests/mes",
    api_key_limit as "API Keys máx",
    price_eur as "Precio €",
    trial_days as "Días prueba",
    array_length(allowed_models, 1) as "Modelos disponibles"
FROM public.plan_limits 
ORDER BY price_eur;

-- Crear un usuario de prueba FREE para verificar límites
INSERT INTO public.users (id, name, email, plan, is_active, email_verified, monthly_requests_used, free_trial_expires_at) 
VALUES (
    'free_test_user',
    'Usuario FREE de Prueba',
    'free@test.com',
    'free',
    true,
    true,
    0,
    NOW() + INTERVAL '7 days'  -- 7 días de prueba
) ON CONFLICT (id) DO UPDATE SET
    plan = EXCLUDED.plan,
    free_trial_expires_at = EXCLUDED.free_trial_expires_at,
    updated_at = NOW();

-- Verificar límites del usuario FREE
SELECT 
    u.name,
    u.plan,
    u.monthly_requests_used,
    pl.monthly_request_limit,
    pl.api_key_limit,
    u.free_trial_expires_at,
    EXTRACT(days FROM (u.free_trial_expires_at - NOW())) as dias_restantes
FROM public.users u
JOIN public.plan_limits pl ON u.plan = pl.plan_name
WHERE u.id = 'free_test_user';