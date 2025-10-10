-- Crear las tablas necesarias para RouteAI
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    plan TEXT DEFAULT 'free',
    api_key_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de API keys
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_value TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de registros de uso
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id TEXT NOT NULL,
    model_used TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_value ON public.api_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON public.usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_model_used ON public.usage_records(model_used);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en la tabla users
DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios
CREATE POLICY "Enable all access for authenticated users on users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas de seguridad para API keys  
CREATE POLICY "Enable all access for authenticated users on api_keys" ON public.api_keys
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas de seguridad para registros de uso
CREATE POLICY "Enable all access for authenticated users on usage_records" ON public.usage_records
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar que las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'api_keys', 'usage_records');