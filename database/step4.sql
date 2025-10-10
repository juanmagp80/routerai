-- ===== PASO 4: Insertar usuarios de prueba =====
-- Ejecuta esta sección después del Paso 3
INSERT INTO users (id, name, email, role, status, department, clerk_user_id, plan) VALUES
  ('admin_test_001', 'Admin User', 'admin@routerai.com', 'admin', 'active', 'Engineering', 'clerk_admin_123', 'enterprise'),
  ('dev_test_001', 'John Developer', 'john@company.com', 'developer', 'active', 'Engineering', 'clerk_dev_456', 'pro'),
  ('viewer_test_001', 'Jane Viewer', 'jane@company.com', 'viewer', 'active', 'Product', 'clerk_viewer_789', 'free'),
  ('pending_test_001', 'Test User', 'test@company.com', 'developer', 'inactive', 'Marketing', NULL, 'starter'),
  ('inactive_test_001', 'Bob Smith', 'bob@company.com', 'developer', 'inactive', 'Engineering', 'clerk_bob_321', 'pro')
ON CONFLICT (email) DO NOTHING;