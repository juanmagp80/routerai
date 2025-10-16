-- Script para actualizar los modelos permitidos en TODOS los planes
-- Incluir los modelos más recientes y económicos en todos los planes

-- Actualizar plan FREE (modelos más económicos y eficientes)
UPDATE public.plan_limits 
SET allowed_models = ARRAY[
    'gpt-3.5-turbo', 
    'gpt-4o-mini', 
    'claude-3-haiku', 
    'claude-3.5-sonnet',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'llama-3.1-8b',
    'mistral-7b'
]
WHERE plan_name = 'free';

-- Actualizar plan STARTER (balance calidad/precio)
UPDATE public.plan_limits 
SET allowed_models = ARRAY[
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-vision',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3.5-sonnet',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'llama-3.1-8b',
    'llama-3.1-70b',
    'mixtral-8x7b',
    'mistral-7b',
    'codestral'
]
WHERE plan_name = 'starter';

-- Actualizar plan PRO (modelos premium y especializados)
UPDATE public.plan_limits 
SET allowed_models = ARRAY[
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-32k',
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-vision',
    'o1-preview',
    'o1-mini',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3-opus',
    'claude-3.5-sonnet',
    'claude-3.5-opus',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-ultra',
    'llama-3.1-8b',
    'llama-3.1-70b',
    'llama-3.1-405b',
    'mixtral-8x7b',
    'mistral-7b',
    'codestral',
    'grok-beta',
    'grok-2',
    'command-r',
    'command-r-plus'
]
WHERE plan_name = 'pro';

-- Actualizar plan ENTERPRISE (acceso completo a todos los modelos)
UPDATE public.plan_limits 
SET allowed_models = ARRAY[
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-32k',
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-vision',
    'o1-preview',
    'o1-mini',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3-opus',
    'claude-3.5-sonnet',
    'claude-3.5-opus',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-ultra',
    'llama-3.1-8b',
    'llama-3.1-70b',
    'llama-3.1-405b',
    'llama-3.2-3b',
    'llama-3.2-90b',
    'mixtral-8x7b',
    'mistral-7b',
    'mistral-small',
    'codestral',
    'codellama-34b',
    'deepseek-coder',
    'starcoder2',
    'grok-beta',
    'grok-2',
    'command-r',
    'command-r-plus',
    'pplx-7b-online',
    'pplx-70b-online',
    'stable-beluga',
    'stable-code',
    'zephyr-7b',
    'falcon-180b'
]
WHERE plan_name = 'enterprise';

-- Verificar los resultados
SELECT 
    plan_name,
    array_length(allowed_models, 1) as model_count,
    allowed_models,
    price_eur,
    monthly_request_limit
FROM public.plan_limits 
ORDER BY price_eur;

-- Verificar específicamente si gemini-2.0-flash está en starter
SELECT 
    plan_name,
    'gemini-2.0-flash' = ANY(allowed_models) as has_gemini_2_flash
FROM public.plan_limits
WHERE plan_name = 'starter';