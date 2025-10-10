-- Test simple para verificar que podemos actualizar la tabla users
-- Ejecuta esto para confirmar que la columna role funciona

-- Contar usuarios actuales
SELECT COUNT(*) as total_users FROM users;

-- Ver algunos usuarios con sus roles actuales
SELECT id, name, email, plan, role 
FROM users 
LIMIT 5;

-- Test: actualizar un usuario específico (cambia el ID por uno real)
-- UPDATE users SET role = 'admin' WHERE id = 'tu_id_de_usuario_real' LIMIT 1;