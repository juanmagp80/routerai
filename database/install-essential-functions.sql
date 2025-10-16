-- Funciones esenciales para el sistema de aprendizaje adaptativo
-- Ejecutar en el Dashboard de Supabase > SQL Editor

-- 1. Función para obtener estadísticas de aprendizaje del usuario
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_models_used', COUNT(DISTINCT model_name),
        'total_usage_count', COALESCE(SUM(usage_count), 0),
        'total_tokens_used', COALESCE(SUM(total_tokens_used), 0),
        'total_cost', COALESCE(SUM(total_cost), 0),
        'average_success_rate', COALESCE(AVG(success_rate), 0),
        'models_by_usage', json_agg(
            json_build_object(
                'model_name', model_name,
                'provider', provider,
                'usage_count', usage_count,
                'success_rate', success_rate,
                'total_cost', total_cost,
                'average_response_time', average_response_time
            ) ORDER BY usage_count DESC
        )
    ) INTO result
    FROM user_model_preferences
    WHERE user_id = p_user_id;

    RETURN COALESCE(result, json_build_object(
        'total_models_used', 0,
        'total_usage_count', 0,
        'total_tokens_used', 0,
        'total_cost', 0,
        'average_success_rate', 0,
        'models_by_usage', json_build_array()
    ));
END;
$$ LANGUAGE plpgsql;

-- 2. Función para obtener modelos recomendados para un usuario
CREATE OR REPLACE FUNCTION get_recommended_models(
    p_user_id TEXT,
    p_task_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'model_name', model_name,
            'provider', provider,
            'usage_count', usage_count,
            'success_rate', success_rate,
            'average_response_time', average_response_time,
            'total_cost', total_cost,
            'recommendation_score', 
                (usage_count * 0.3) + 
                (success_rate * 100 * 0.4) + 
                (CASE WHEN average_response_time > 0 THEN (10000.0 / average_response_time) * 0.2 ELSE 0 END) +
                (CASE WHEN total_cost > 0 THEN (1.0 / total_cost) * 0.1 ELSE 10 END)
        ) ORDER BY 
            (usage_count * 0.3) + 
            (success_rate * 100 * 0.4) + 
            (CASE WHEN average_response_time > 0 THEN (10000.0 / average_response_time) * 0.2 ELSE 0 END) +
            (CASE WHEN total_cost > 0 THEN (1.0 / total_cost) * 0.1 ELSE 10 END) DESC
        LIMIT p_limit
    ) INTO result
    FROM user_model_preferences
    WHERE user_id = p_user_id
    AND (p_task_type IS NULL OR task_types ? p_task_type);

    RETURN COALESCE(result, json_build_array());
END;
$$ LANGUAGE plpgsql;

-- 3. Función para registrar el uso de un modelo (básica)
CREATE OR REPLACE FUNCTION upsert_model_usage(
    p_user_id TEXT,
    p_model_name TEXT,
    p_provider TEXT,
    p_tokens_used INTEGER,
    p_cost DECIMAL,
    p_response_time INTEGER,
    p_was_manual_selection BOOLEAN DEFAULT FALSE,
    p_success BOOLEAN DEFAULT TRUE,
    p_task_type TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_model_preferences (
        user_id, model_name, provider, usage_count, total_tokens_used, 
        total_cost, average_response_time, manual_selections_count,
        success_rate, error_count, task_types, last_used_at
    ) VALUES (
        p_user_id, p_model_name, p_provider, 1, p_tokens_used,
        p_cost, p_response_time, 
        CASE WHEN p_was_manual_selection THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        CASE WHEN p_task_type IS NOT NULL THEN jsonb_build_object(p_task_type, 1) ELSE '{}' END,
        NOW()
    )
    ON CONFLICT (user_id, model_name) DO UPDATE SET
        usage_count = user_model_preferences.usage_count + 1,
        total_tokens_used = user_model_preferences.total_tokens_used + p_tokens_used,
        total_cost = user_model_preferences.total_cost + p_cost,
        average_response_time = (user_model_preferences.average_response_time * user_model_preferences.usage_count + p_response_time) / (user_model_preferences.usage_count + 1),
        manual_selections_count = user_model_preferences.manual_selections_count + CASE WHEN p_was_manual_selection THEN 1 ELSE 0 END,
        success_rate = (user_model_preferences.success_rate * user_model_preferences.usage_count + CASE WHEN p_success THEN 1.0 ELSE 0.0 END) / (user_model_preferences.usage_count + 1),
        error_count = user_model_preferences.error_count + CASE WHEN p_success THEN 0 ELSE 1 END,
        task_types = CASE 
            WHEN p_task_type IS NOT NULL THEN 
                COALESCE(user_model_preferences.task_types, '{}'::jsonb) || 
                jsonb_build_object(p_task_type, COALESCE((user_model_preferences.task_types->p_task_type)::INTEGER, 0) + 1)
            ELSE user_model_preferences.task_types
        END,
        last_used_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Función para calcular score personalizado
CREATE OR REPLACE FUNCTION calculate_model_score(
    p_user_id TEXT,
    p_model_name TEXT,
    p_task_type TEXT DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    usage_factor DECIMAL := 0;
    success_factor DECIMAL := 0;
    manual_selection_factor DECIMAL := 0;
    context_factor DECIMAL := 0;
    total_score DECIMAL;
BEGIN
    -- Obtener métricas del modelo para el usuario
    SELECT 
        -- Factor de uso (más uso = mayor confianza)
        LEAST(usage_count * 0.1, 1.0),
        -- Factor de éxito (tasa de éxito normalizada)
        success_rate,
        -- Factor de selección manual (preferencia explícita del usuario)
        CASE 
            WHEN usage_count > 0 THEN LEAST(manual_selections_count::DECIMAL / usage_count, 0.3)
            ELSE 0
        END
    INTO usage_factor, success_factor, manual_selection_factor
    FROM user_model_preferences
    WHERE user_id = p_user_id AND model_name = p_model_name;

    -- Factor de contexto (si el modelo se ha usado en este tipo de tarea)
    IF p_task_type IS NOT NULL THEN
        SELECT CASE 
            WHEN task_types ? p_task_type THEN 0.1
            ELSE 0
        END INTO context_factor
        FROM user_model_preferences
        WHERE user_id = p_user_id AND model_name = p_model_name;
    END IF;

    -- Calcular puntuación total
    total_score := COALESCE(usage_factor, 0) + 
                   COALESCE(success_factor, 0) + 
                   COALESCE(manual_selection_factor, 0) + 
                   COALESCE(context_factor, 0);

    RETURN GREATEST(total_score, 0.1); -- Mínimo score de 0.1
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
DO $$ 
BEGIN 
    RAISE NOTICE '🎉 FUNCIONES DE APRENDIZAJE INSTALADAS CORRECTAMENTE!';
    RAISE NOTICE '📋 Funciones disponibles:';
    RAISE NOTICE '   - get_user_learning_stats(user_id)';
    RAISE NOTICE '   - get_recommended_models(user_id, task_type, limit)';
    RAISE NOTICE '   - upsert_model_usage(user_id, model, provider, ...)';
    RAISE NOTICE '   - calculate_model_score(user_id, model, task_type)';
END $$;