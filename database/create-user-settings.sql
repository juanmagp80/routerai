-- Crear tabla para configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver/editar sus propias configuraciones
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();