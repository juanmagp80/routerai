-- Debug: Verificar el usuario logueado y permisos
-- Ejecuta esto en Supabase para ver el estado de tu usuario

-- 1. Buscar tu usuario por email
SELECT id, name, email, role, status, plan, clerk_user_id, is_active
FROM users 
WHERE email = 'juanmagpdev@gmail.com';

-- 2. Ver todos los usuarios con role admin
SELECT id, name, email, role, status, plan 
FROM users 
WHERE role = 'admin';

-- 3. Ver estructura de la tabla api_keys para verificar relaciones
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
ORDER BY ordinal_position;