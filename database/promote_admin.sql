-- Script para promover usuarios a administrador manualmente
-- Ejecutar en Supabase SQL Editor o usar este script como referencia

-- 1. Verificar usuarios existentes
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 2. Promover un usuario específico a admin (reemplazar 'user@example.com' con el email real)
UPDATE users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'user@example.com';

-- 3. Promover usuarios de un dominio específico a admin (reemplazar 'yourcompany.com' con tu dominio)
UPDATE users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email LIKE '%@yourcompany.com';

-- 4. Verificar que los cambios se aplicaron correctamente
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  updated_at
FROM users 
WHERE role = 'admin'
ORDER BY updated_at DESC;

-- 5. Crear un usuario admin desde cero (si es necesario)
INSERT INTO users (
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@yourcompany.com',
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 6. Ver estadísticas de roles
SELECT 
  role,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM users 
GROUP BY role
ORDER BY count DESC;