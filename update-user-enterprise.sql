-- Script para actualizar el usuario juanmagpdev@gmail.com a plan ENTERPRISE
-- Y asegurar que tenga acceso a todos los modelos enterprise

-- Primero verificamos si la tabla users tiene la columna plan, si no la agregamos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='plan') THEN
        ALTER TABLE users ADD COLUMN plan VARCHAR(50) DEFAULT 'FREE';
    END IF;
END $$;

-- Verificamos el usuario actual
SELECT id, name, email, plan FROM users WHERE email = 'juanmagpdev@gmail.com';

-- Actualizar el plan del usuario a ENTERPRISE
UPDATE users 
SET plan = 'ENTERPRISE',
    updated_at = NOW()
WHERE email = 'juanmagpdev@gmail.com';

-- Insertar o actualizar configuraciones de todos los planes
INSERT INTO plan_limits (plan_name, api_key_limit, monthly_request_limit, rate_limit_per_minute, allowed_models, price_eur, stripe_price_id, features, trial_days) VALUES

-- Plan FREE
('FREE', 2, 1000, 10, 
 ARRAY['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 'mistral-7b'], 
 0.00, 'free', 
 ARRAY['9 modelos básicos de IA', '2 API keys', '1,000 requests/mes', '10 requests/minuto', 'Soporte comunitario'], 
 7),

-- Plan STARTER
('STARTER', 5, 10000, 25, 
 ARRAY['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 'mistral-7b', 'gpt-4', 'gpt-4o', 'gpt-4-vision', 'claude-3-sonnet', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro', 'llama-3.1-70b', 'mixtral-8x7b', 'codestral'], 
 9.99, 'price_starter_123', 
 ARRAY['19 modelos de IA', '5 API keys', '10,000 requests/mes', '25 requests/minuto', 'Soporte por email'], 
 14),

-- Plan PRO
('PRO', 15, 100000, 50, 
 ARRAY['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 'mistral-7b', 'gpt-4', 'gpt-4o', 'gpt-4-vision', 'claude-3-sonnet', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro', 'llama-3.1-70b', 'mixtral-8x7b', 'codestral', 'gpt-4-turbo', 'claude-3-opus', 'claude-3.5-opus', 'llama-3.1-405b', 'grok-beta', 'grok-2', 'command-r', 'command-r-plus'], 
 49.99, 'price_1SCLO32ULfqKVBqV0CitIdp1', 
 ARRAY['27 modelos avanzados de IA', '15 API keys', '100,000 requests/mes', '50 requests/minuto', 'Soporte prioritario'], 
 0),

-- Plan ENTERPRISE
('ENTERPRISE', 50, 1000000, 100, 
 ARRAY['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 'mistral-7b', 'gpt-4', 'gpt-4o', 'gpt-4-vision', 'claude-3-sonnet', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro', 'llama-3.1-70b', 'mixtral-8x7b', 'codestral', 'gpt-4-turbo', 'claude-3-opus', 'claude-3.5-opus', 'llama-3.1-405b', 'grok-beta', 'grok-2', 'command-r', 'command-r-plus', 'llama-3.2-3b', 'llama-3.2-90b', 'mistral-small', 'codellama-34b', 'deepseek-coder', 'starcoder2', 'pplx-7b-online', 'pplx-70b-online', 'stable-beluga', 'stable-code', 'zephyr-7b', 'falcon-180b'], 
 299.00, 'price_1SCLO32ULfqKVBqV0CitIdp0', 
 ARRAY['Acceso a todos los 40+ modelos de IA', 'Límites de uso más altos', 'Soporte prioritario 24/7', '50 API keys', '1,000,000 requests/mes', '100 requests/minuto'], 
 0)

ON CONFLICT (plan_name) DO UPDATE SET
    api_key_limit = EXCLUDED.api_key_limit,
    monthly_request_limit = EXCLUDED.monthly_request_limit,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    allowed_models = EXCLUDED.allowed_models,
    price_eur = EXCLUDED.price_eur,
    stripe_price_id = EXCLUDED.stripe_price_id,
    features = EXCLUDED.features,
    trial_days = EXCLUDED.trial_days;

-- Verificar la actualización del usuario
SELECT id, name, email, plan FROM users WHERE email = 'juanmagpdev@gmail.com';

-- Verificar los modelos permitidos para el plan ENTERPRISE
SELECT 
    u.email,
    u.plan,
    pl.plan_name,
    pl.api_key_limit,
    pl.monthly_request_limit,
    pl.rate_limit_per_minute,
    array_length(pl.allowed_models, 1) as total_models_allowed,
    pl.price_eur,
    pl.allowed_models
FROM users u
JOIN plan_limits pl ON u.plan = pl.plan_name
WHERE u.email = 'juanmagpdev@gmail.com';

-- Verificar que todos los modelos enterprise están incluidos
SELECT 
    u.email,
    u.plan,
    CASE 
        WHEN pl.allowed_models @> ARRAY[
            'gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 
            'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 
            'mistral-7b', 'gpt-4', 'gpt-4o', 'gpt-4-vision', 'claude-3-sonnet', 
            'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro', 'llama-3.1-70b', 
            'mixtral-8x7b', 'codestral', 'gpt-4-turbo', 'claude-3-opus', 
            'claude-3.5-opus', 'llama-3.1-405b', 'grok-beta', 'grok-2', 
            'command-r', 'command-r-plus', 'llama-3.2-3b', 'llama-3.2-90b', 
            'mistral-small', 'codellama-34b', 'deepseek-coder', 'starcoder2', 
            'pplx-7b-online', 'pplx-70b-online', 'stable-beluga', 'stable-code', 
            'zephyr-7b', 'falcon-180b'
        ] 
        THEN 'ENTERPRISE MODELS CORRECTLY CONFIGURED ✅'
        ELSE 'ENTERPRISE MODELS MISSING ❌'
    END as validation_status,
    array_length(pl.allowed_models, 1) as models_count
FROM users u
JOIN plan_limits pl ON u.plan = pl.plan_name
WHERE u.email = 'juanmagpdev@gmail.com';

-- Mostrar todos los modelos disponibles para el usuario
SELECT 
    'Available models for ' || u.email || ' (Plan: ' || u.plan || ')' as info,
    unnest(pl.allowed_models) as available_model
FROM users u
JOIN plan_limits pl ON u.plan = pl.plan_name
WHERE u.email = 'juanmagpdev@gmail.com'
ORDER BY available_model;