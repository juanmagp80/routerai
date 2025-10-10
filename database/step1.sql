-- Migración paso a paso - Ejecuta cada sección por separado
-- Copia y pega cada sección una por una en Supabase SQL Editor

-- ===== PASO 1: Agregar columna role =====
-- Ejecuta solo esta sección primero
DO $$ 
BEGIN 
    -- Agregar columna role (necesaria para nuestro sistema de admin)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'viewer' 
        CHECK (role IN ('admin', 'developer', 'viewer'));
        
        RAISE NOTICE 'Columna role agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna role ya existe';
    END IF;
END $$;