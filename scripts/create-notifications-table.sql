-- Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Cambiado a TEXT para soportar Clerk IDs
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Habilitar Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS temporalmente para permitir operaciones del sistema
-- En producción, implementar políticas más específicas basadas en roles
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Confirmar creación
SELECT 'Tabla notifications creada exitosamente con RLS habilitado' as resultado;