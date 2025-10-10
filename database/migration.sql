-- Migración específica para adaptar la base de datos existente
-- Ejecuta este script en Supabase SQL Editor

-- Paso 1: Agregar la columna 'role' que falta en users
DO $$ 
BEGIN 
    -- Agregar columna role (necesaria para nuestro sistema de admin)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'viewer' 
        CHECK (role IN ('admin', 'developer', 'viewer'));
        
        -- Actualizar usuarios existentes según su plan
        UPDATE users SET role = 'admin' WHERE plan = 'enterprise' OR plan = 'premium';
        UPDATE users SET role = 'developer' WHERE plan = 'pro' OR plan = 'starter';
        UPDATE users SET role = 'viewer' WHERE plan = 'free' OR role IS NULL;
        
        -- Crear índice para role dentro del mismo bloque
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)';
    END IF;
END $$;

-- Paso 2: Verificar que el índice se creó (opcional)
-- El índice ya se creó en el paso anterior

-- Paso 3: Insertar algunos usuarios de prueba para el admin (si no existen)
INSERT INTO users (id, name, email, role, status, department, clerk_user_id, plan) VALUES
  ('admin_test_001', 'Admin User', 'admin@routerai.com', 'admin', 'active', 'Engineering', 'clerk_admin_123', 'enterprise'),
  ('dev_test_001', 'John Developer', 'john@company.com', 'developer', 'active', 'Engineering', 'clerk_dev_456', 'pro'),
  ('viewer_test_001', 'Jane Viewer', 'jane@company.com', 'viewer', 'active', 'Product', 'clerk_viewer_789', 'free'),
  ('pending_test_001', 'Test User', 'test@company.com', 'developer', 'inactive', 'Marketing', NULL, 'starter'),
  ('inactive_test_001', 'Bob Smith', 'bob@company.com', 'developer', 'inactive', 'Engineering', 'clerk_bob_321', 'pro')
ON CONFLICT (email) DO NOTHING;

-- Paso 4: Verificar la estructura actualizada
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