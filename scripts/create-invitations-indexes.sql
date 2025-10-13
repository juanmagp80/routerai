-- PASO 2: Después de que el PASO 1 funcione, ejecuta estos índices uno por uno:

-- Ejecuta este primero:
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Luego este:
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Y finalmente este:
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);