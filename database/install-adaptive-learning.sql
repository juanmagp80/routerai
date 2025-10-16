-- Script de instalación completo para el sistema de aprendizaje adaptativo
-- Ejecutar este script paso a paso en Supabase SQL Editor

-- PASO 1: Verificar la estructura existente
DO $$
DECLARE
    users_exists BOOLEAN;
    users_id_type TEXT;
    usage_records_exists BOOLEAN;
BEGIN
    -- Verificar tabla users
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO users_exists;
    
    IF users_exists THEN
        SELECT data_type INTO users_id_type
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
        
        RAISE NOTICE '✅ Tabla users encontrada - ID tipo: %', users_id_type;
    ELSE
        RAISE NOTICE '❌ Tabla users NO encontrada';
    END IF;
    
    -- Verificar tabla usage_records
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'usage_records'
    ) INTO usage_records_exists;
    
    IF usage_records_exists THEN
        RAISE NOTICE '✅ Tabla usage_records encontrada';
    ELSE
        RAISE NOTICE '❌ Tabla usage_records NO encontrada';
    END IF;
END $$;

-- PASO 2: Crear las tablas de aprendizaje (sin claves foráneas inicialmente)
CREATE TABLE IF NOT EXISTS user_model_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Usar TEXT para compatibilidad con Clerk
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

CREATE TABLE IF NOT EXISTS user_model_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Usar TEXT para compatibilidad con Clerk
    usage_record_id UUID, -- Sin referencia inicial
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

-- PASO 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_user_id ON user_model_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_model ON user_model_preferences(model_name);
CREATE INDEX IF NOT EXISTS idx_user_model_preferences_last_used ON user_model_preferences(last_used_at);

CREATE INDEX IF NOT EXISTS idx_user_model_feedback_user_id ON user_model_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_model_feedback_model ON user_model_feedback(model_name);
CREATE INDEX IF NOT EXISTS idx_user_model_feedback_rating ON user_model_feedback(rating);

-- PASO 4: Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear el trigger de forma segura
DO $$
BEGIN
    -- Intentar crear el trigger, ignorando si ya existe
    BEGIN
        CREATE TRIGGER update_user_model_preferences_updated_at 
            BEFORE UPDATE ON user_model_preferences 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE '✅ Trigger update_user_model_preferences_updated_at creado';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE '⚠️  Trigger update_user_model_preferences_updated_at ya existe';
        WHEN OTHERS THEN
            RAISE WARNING 'Error creando trigger: %', SQLERRM;
    END;
END $$;

-- PASO 5: Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 Tablas de aprendizaje adaptativo creadas exitosamente!';
    RAISE NOTICE '📋 Próximos pasos:';
    RAISE NOTICE '   1. Ejecutar add-foreign-keys.sql para agregar referencias';
    RAISE NOTICE '   2. Ejecutar create-learning-functions.sql para funciones';
    RAISE NOTICE '   3. Probar el sistema desde la aplicación';
END $$;