-- Arreglar políticas RLS para user_settings
-- Primero, eliminar las políticas existentes
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Desactivar RLS temporalmente para development
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- O si quieres mantener RLS, usar políticas más permisivas:
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable all for authenticated users" ON user_settings
--     FOR ALL USING (auth.role() = 'authenticated');

-- Verificar que la tabla existe
SELECT * FROM user_settings LIMIT 1;