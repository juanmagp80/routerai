-- PASO 1: Eliminar tablas existentes (si las hay) para empezar limpio
DROP TABLE IF EXISTS public.usage_records CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE; 
DROP TABLE IF EXISTS public.users CASCADE;

-- PASO 2: Crear tabla de usuarios
CREATE TABLE public.users (
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

-- Verificar que la tabla users se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';