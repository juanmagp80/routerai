-- PASO 3: Verificación (opcional)
-- Ejecuta esto para confirmar que todo se creó correctamente:

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'invitations' 
ORDER BY ordinal_position;