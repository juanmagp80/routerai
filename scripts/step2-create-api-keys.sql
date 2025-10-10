-- PASO 3: Crear tabla de API keys
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Verificar que la tabla api_keys se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'api_keys' AND table_schema = 'public';