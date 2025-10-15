-- SCRIPT DE RESET PARA TABLA NOTIFICATIONS
-- Ejecutar TODO este bloque de una vez en Supabase SQL Editor

-- Paso 1: Eliminar tabla existente si tiene problemas
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Paso 2: Crear tabla completamente nueva con el esquema correcto
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk IDs son strings, no UUIDs
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear índices para mejor rendimiento
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Paso 4: Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Confirmación final
SELECT 'Tabla notifications recreada exitosamente' as resultado;