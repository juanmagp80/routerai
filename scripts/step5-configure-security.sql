-- PASO 6: Configurar triggers y RLS
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la tabla users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso simplificadas (permisivas para desarrollo)
CREATE POLICY "Allow authenticated users full access to users" 
    ON public.users FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to api_keys" 
    ON public.api_keys FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to usage_records" 
    ON public.usage_records FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Verificar configuración RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'api_keys', 'usage_records');