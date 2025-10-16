-- Verificar el tipo de la columna id en la tabla users
DO $$
DECLARE
    users_id_type TEXT;
BEGIN
    SELECT data_type INTO users_id_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
    
    -- Mostrar el tipo encontrado
    RAISE NOTICE 'Tipo de users.id encontrado: %', COALESCE(users_id_type, 'TABLA NO ENCONTRADA');
END $$;

-- Tabla para almacenar patrones de aprendizaje de modelo por usuario
-- Usar TEXT para user_id para compatibilidad con Clerk
CREATE TABLE IF NOT EXISTS user_model_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Cambiar a TEXT para compatibilidad con Clerk
    model_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    
    -- Métricas de uso
    usage_count INTEGER DEFAULT 1,
    total_tokens_used INTEGER DEFAULT 0,
    total_cost DECIMAL(10,6) DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- en milisegundos
    
    -- Métricas de satisfacción
    manual_selections_count INTEGER DEFAULT 0, -- cuántas veces el usuario eligió este modelo manualmente
    user_rating_sum INTEGER DEFAULT 0, -- suma de calificaciones del usuario (1-5)
    user_rating_count INTEGER DEFAULT 0, -- número de calificaciones
    
    -- Contexto de uso
    task_types JSONB DEFAULT '{}', -- ej: {"coding": 15, "writing": 8, "analysis": 3}
    time_preferences JSONB DEFAULT '{}', -- patrones de uso por hora del día
    message_length_preferences JSONB DEFAULT '{}', -- preferencias por longitud de mensaje
    
    -- Métricas de rendimiento
    success_rate DECIMAL(5,4) DEFAULT 1.0, -- tasa de éxito (0-1)
    error_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, model_name)
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_user_id ON user_model_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_model ON user_model_preferences(model_name);
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_last_used ON user_model_preferences(last_used_at);

-- Tabla para almacenar feedback específico del usuario sobre respuestas
CREATE TABLE IF NOT EXISTS user_model_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Cambiar a TEXT para compatibilidad con Clerk
    usage_record_id UUID REFERENCES usage_records(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    
    -- Feedback del usuario
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 estrellas
    feedback_text TEXT,
    feedback_categories JSONB, -- ej: {"accuracy": true, "speed": false, "cost": true}
    
    -- Contexto del feedback
    task_type TEXT, -- coding, writing, analysis, etc.
    message_length INTEGER,
    complexity_level TEXT, -- simple, medium, complex
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_model_feedback_user_id ON user_model_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_model_feedback_model ON user_model_feedback(model_name);
CREATE INDEX IF NOT EXISTS idx_user_model_feedback_rating ON user_model_feedback(rating);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_model_preferences_updated_at 
    BEFORE UPDATE ON user_model_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular score de un modelo para un usuario
CREATE OR REPLACE FUNCTION calculate_model_score(
    p_user_id TEXT, -- Cambiar a TEXT para compatibilidad con Clerk
    p_model_name TEXT,
    p_task_type TEXT DEFAULT NULL,
    p_message_length INTEGER DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    base_score DECIMAL := 0.5;
    usage_factor DECIMAL := 0;
    rating_factor DECIMAL := 0;
    success_factor DECIMAL := 0;
    manual_selection_factor DECIMAL := 0;
    context_factor DECIMAL := 0;
    total_score DECIMAL;
BEGIN
    -- Obtener métricas del modelo para el usuario
    SELECT 
        -- Factor de uso (más uso = mayor confianza)
        LEAST(usage_count / 100.0, 0.3),
        -- Factor de calificación del usuario
        CASE 
            WHEN user_rating_count > 0 THEN (user_rating_sum::DECIMAL / user_rating_count / 5.0) * 0.4
            ELSE 0
        END,
        -- Factor de éxito
        success_rate * 0.2,
        -- Factor de selección manual (preferencia explícita)
        LEAST(manual_selections_count / 50.0, 0.2)
    INTO usage_factor, rating_factor, success_factor, manual_selection_factor
    FROM user_model_preferences 
    WHERE user_id = p_user_id AND model_name = p_model_name;
    
    -- Si no hay datos, retornar score base
    IF NOT FOUND THEN
        RETURN base_score;
    END IF;
    
    -- Calcular score total
    total_score := base_score + usage_factor + rating_factor + success_factor + manual_selection_factor;
    
    -- Asegurar que esté en rango válido (0-1)
    RETURN GREATEST(0, LEAST(1, total_score));
END;
$$ LANGUAGE plpgsql;