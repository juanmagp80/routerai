-- ===== PASO 5: Verificar estructura =====
-- Ejecuta esta sección al final para verificar que todo está correcto
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'name', 'email', 'role', 'status', 'department', 'clerk_user_id', 'plan')
ORDER BY 
    CASE column_name 
        WHEN 'id' THEN 1
        WHEN 'name' THEN 2
        WHEN 'email' THEN 3
        WHEN 'role' THEN 4
        WHEN 'status' THEN 5
        WHEN 'department' THEN 6
        WHEN 'clerk_user_id' THEN 7
        WHEN 'plan' THEN 8
        ELSE 9
    END;

-- También verificar algunos usuarios
SELECT id, name, email, role, status, plan FROM users ORDER BY created_at DESC LIMIT 10;