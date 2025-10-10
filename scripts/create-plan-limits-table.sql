-- Script para crear la tabla plan_limits y datos necesarios
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla de límites por plan
CREATE TABLE IF NOT EXISTS public.plan_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT UNIQUE NOT NULL,
    api_key_limit INTEGER NOT NULL,
    monthly_request_limit INTEGER NOT NULL,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
    allowed_models TEXT[] NOT NULL DEFAULT '{}',
    price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
    stripe_price_id TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    trial_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar los planes disponibles
INSERT INTO public.plan_limits (
    plan_name,
    api_key_limit,
    monthly_request_limit,
    rate_limit_per_minute,
    allowed_models,
    price_eur,
    stripe_price_id,
    features,
    trial_days
) VALUES 
(
    'free',
    3,
    25,  -- 25 requests por semana (convertiremos a mensual)
    10,
    ARRAY['gpt-3.5-turbo', 'gemini-pro'],
    0.00,
    NULL,
    ARRAY['3 API keys', '25 requests/week', 'Basic models', 'Community support'],
    7
),
(
    'starter',
    10,
    10000,
    100,
    ARRAY['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet', 'gemini-pro', 'gemini-1.5-pro'],
    29.00,
    'price_1NXX',  -- Reemplazar con el price_id real de Stripe
    ARRAY['10 API keys', '10,000 requests/month', 'All AI models', 'Priority support', 'Analytics dashboard'],
    0
),
(
    'pro',
    25,
    100000,
    500,
    ARRAY['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'gemini-pro', 'gemini-1.5-pro'],
    49.00,
    'price_1NXY',  -- Reemplazar con el price_id real de Stripe
    ARRAY['25 API keys', '100,000 requests/month', 'All AI models', 'Priority support', 'Advanced analytics', 'Custom integrations'],
    0
),
(
    'enterprise',
    999,  -- Prácticamente ilimitado
    1000000,
    1000,
    ARRAY['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'gemini-pro', 'gemini-1.5-pro'],
    199.00,
    'price_1NXZ',  -- Reemplazar con el price_id real de Stripe
    ARRAY['Unlimited API keys', '1,000,000 requests/month', 'All AI models', '24/7 dedicated support', 'Custom analytics', 'On-premise deployment', 'SLA guarantees'],
    0
)
ON CONFLICT (plan_name) DO UPDATE SET
    api_key_limit = EXCLUDED.api_key_limit,
    monthly_request_limit = EXCLUDED.monthly_request_limit,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    allowed_models = EXCLUDED.allowed_models,
    price_eur = EXCLUDED.price_eur,
    stripe_price_id = EXCLUDED.stripe_price_id,
    features = EXCLUDED.features,
    trial_days = EXCLUDED.trial_days;

-- 3. Actualizar tabla users para incluir campos necesarios para límites
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS monthly_requests_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS free_trial_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 4. Actualizar el plan por defecto a 'free' si es NULL
UPDATE public.users 
SET plan = 'free' 
WHERE plan IS NULL;

-- 5. Crear tabla de notificaciones para el sistema
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'limit_warning', 'trial_ending', 'upgrade_suggestion'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS idx_plan_limits_plan_name ON public.plan_limits(plan_name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- 7. Verificar que todo se creó correctamente
SELECT 
    plan_name,
    api_key_limit,
    monthly_request_limit,
    price_eur,
    trial_days,
    array_length(allowed_models, 1) as models_count,
    array_length(features, 1) as features_count
FROM public.plan_limits 
ORDER BY price_eur;

-- 8. Verificar estructura de tabla users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;