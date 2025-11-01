-- Crear tabla para alertas de costo
CREATE TABLE IF NOT EXISTS cost_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('daily_80_percent', 'monthly_50_percent', 'unusual_spike', 'global_limit', 'plan_exceeded')),
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by TEXT
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_cost_alerts_user_id ON cost_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_created_at ON cost_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_severity ON cost_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_type ON cost_alerts(alert_type);

-- Crear índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_cost_alerts_user_severity_date ON cost_alerts(user_id, severity, created_at DESC);

-- Configurar RLS (Row Level Security)
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias alertas
CREATE POLICY "Users can view own alerts" ON cost_alerts
FOR SELECT USING (user_id = auth.uid() OR user_id = 'SYSTEM');

-- Política para que el sistema pueda insertar alertas
CREATE POLICY "System can insert alerts" ON cost_alerts
FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan marcar sus alertas como reconocidas
CREATE POLICY "Users can acknowledge own alerts" ON cost_alerts
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Función para limpiar alertas antiguas (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM cost_alerts 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Crear un trigger para ejecutar la limpieza automáticamente
-- (se puede configurar con pg_cron si está disponible)

COMMENT ON TABLE cost_alerts IS 'Almacena alertas de costo y límites del sistema';
COMMENT ON COLUMN cost_alerts.user_id IS 'ID del usuario (clerk_user_id) o SYSTEM para alertas globales';
COMMENT ON COLUMN cost_alerts.metadata IS 'Datos adicionales como costos actuales, límites, porcentajes, etc.';
COMMENT ON FUNCTION cleanup_old_alerts() IS 'Limpia alertas de más de 30 días para mantener la tabla optimizada';