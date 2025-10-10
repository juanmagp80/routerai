-- PASO 4: Crear tabla de registros de uso
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar que la tabla usage_records se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usage_records' AND table_schema = 'public';