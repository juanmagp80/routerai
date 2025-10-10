-- Agregar columna role de forma directa sin bloque DO
-- Ejecuta esto si la columna no existe

ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'viewer' 
CHECK (role IN ('admin', 'developer', 'viewer'));