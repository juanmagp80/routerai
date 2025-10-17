-- Crear una API key de prueba para testing
INSERT INTO public.api_keys (
    user_id,
    name,
    key_hash,
    is_active,
    created_at
) VALUES (
    'user_33t2Znh2CEyo72pUNBXLCPOiIvK', -- El usuario que existe en user_settings
    'Test API Key', 
    'sk-test-12345678901234567890123456789012345678901234567890',
    true,
    NOW()
);

-- Verificar que se creó
SELECT * FROM public.api_keys WHERE user_id = 'user_33t2Znh2CEyo72pUNBXLCPOiIvK';