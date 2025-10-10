-- ===== PASO 3: Crear índice =====
-- Ejecuta esta sección después del Paso 2
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);