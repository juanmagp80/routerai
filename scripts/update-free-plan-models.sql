-- Script para actualizar los modelos permitidos en el plan free
-- Añadimos los modelos más económicos: gpt-4o-mini, claude-3-haiku, gemini-2.0-flash

UPDATE public.plan_limits 
SET allowed_models = ARRAY['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'gemini-2.0-flash']
WHERE plan_name = 'free';

-- Verificar el resultado
SELECT 
    plan_name,
    allowed_models,
    price_eur,
    monthly_request_limit
FROM public.plan_limits 
WHERE plan_name = 'free';