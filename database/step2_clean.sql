-- ===== PASO 2: Actualizar roles existentes =====
-- Ejecuta cada línea por separado para mayor control

-- Primero actualizar los admin
UPDATE users SET role = 'admin' WHERE plan = 'enterprise' OR plan = 'premium';

-- Luego los developers
UPDATE users SET role = 'developer' WHERE plan = 'pro' OR plan = 'starter';

-- Finalmente los viewers
UPDATE users SET role = 'viewer' WHERE plan = 'free' OR plan IS NULL;

-- Verificar los cambios
SELECT plan, role, COUNT(*) as count 
FROM users 
GROUP BY plan, role 
ORDER BY plan, role;