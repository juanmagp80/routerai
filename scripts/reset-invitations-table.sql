-- SCRIPT DE RESET COMPLETO - Ejecuta TODO este bloque de una vez
-- Este script eliminará la tabla existente (si existe) y la recreará correctamente

-- Paso 1: Eliminar tabla existente si tiene problemas
DROP TABLE IF EXISTS invitations CASCADE;

-- Paso 2: Crear tabla completamente nueva
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  token VARCHAR(255) NOT NULL UNIQUE,
  created_by VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  resend_count INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by VARCHAR(255)
);

-- Paso 3: Crear índices
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- Confirmación final
SELECT 'Tabla invitations creada exitosamente' as resultado;