-- Funciones optimizadas para el sistema de aprendizaje adaptativo
-- Compatible con user_id de tipo TEXT (Clerk)

-- Función para insertar o actualizar el uso de un modelo
CREATE OR REPLACE FUNCTION upsert_model_usage(
    p_user_id TEXT,
    p_model_name TEXT,
    p_provider TEXT,
    p_tokens_used INTEGER,
    p_cost DECIMAL,
    p_response_time INTEGER,
    p_was_manual_selection BOOLEAN DEFAULT FALSE,
    p_success BOOLEAN DEFAULT TRUE,
    p_task_type TEXT DEFAULT NULL,
    p_time_of_day INTEGER DEFAULT NULL,
    p_message_length_bucket TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insertar o actualizar preferencias del modelo
    INSERT INTO user_model_preferences (
        user_id, model_name, provider, usage_count, total_tokens_used, 
        total_cost, average_response_time, manual_selections_count,
        success_rate, error_count, task_types, time_preferences, 
        message_length_preferences, last_used_at
    ) VALUES (
        p_user_id, p_model_name, p_provider, 1, p_tokens_used,
        p_cost, p_response_time, 
        CASE WHEN p_was_manual_selection THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        CASE WHEN p_task_type IS NOT NULL THEN jsonb_build_object(p_task_type, 1) ELSE '{}' END,
        CASE WHEN p_time_of_day IS NOT NULL THEN jsonb_build_object(p_time_of_day::TEXT, 1) ELSE '{}' END,
        CASE WHEN p_message_length_bucket IS NOT NULL THEN jsonb_build_object(p_message_length_bucket, 1) ELSE '{}' END,
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
        time_preferences = CASE 
            WHEN p_time_of_day IS NOT NULL THEN 
                COALESCE(user_model_preferences.time_preferences, '{}'::jsonb) || 
                jsonb_build_object(p_time_of_day::TEXT, COALESCE((user_model_preferences.time_preferences->p_time_of_day::TEXT)::INTEGER, 0) + 1)
            ELSE user_model_preferences.time_preferences
        END,
        message_length_preferences = CASE 
            WHEN p_message_length_bucket IS NOT NULL THEN 
                COALESCE(user_model_preferences.message_length_preferences, '{}'::jsonb) || 
                jsonb_build_object(p_message_length_bucket, COALESCE((user_model_preferences.message_length_preferences->p_message_length_bucket)::INTEGER, 0) + 1)
            ELSE user_model_preferences.message_length_preferences
        END,
        last_used_at = NOW(),
        updated_at = NOW();
        
    RAISE NOTICE 'Uso actualizado para usuario % modelo %', p_user_id, p_model_name;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el rating de un modelo
CREATE OR REPLACE FUNCTION update_model_rating(
    p_user_id TEXT,
    p_model_name TEXT,
    p_rating INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE user_model_preferences 
    SET 
        user_rating_sum = user_rating_sum + p_rating,
        user_rating_count = user_rating_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id AND model_name = p_model_name;
    
    -- Si no existe registro, crearlo
    IF NOT FOUND THEN
        INSERT INTO user_model_preferences (user_id, model_name, provider, user_rating_sum, user_rating_count)
        VALUES (p_user_id, p_model_name, 'unknown', p_rating, 1);
    END IF;
    
    RAISE NOTICE 'Rating actualizado para usuario % modelo %: %', p_user_id, p_model_name, p_rating;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular score de un modelo para un usuario
CREATE OR REPLACE FUNCTION calculate_model_score(
    p_user_id TEXT,
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
    
    -- Añadir factor de contexto si se proporciona tipo de tarea
    IF p_task_type IS NOT NULL THEN
        SELECT COALESCE((task_types->p_task_type)::INTEGER, 0) / 20.0
        INTO context_factor
        FROM user_model_preferences 
        WHERE user_id = p_user_id AND model_name = p_model_name;
        
        context_factor := LEAST(context_factor, 0.1); -- Máximo 0.1 por contexto
    END IF;
    
    -- Calcular score total
    total_score := base_score + usage_factor + rating_factor + success_factor + manual_selection_factor + context_factor;
    
    -- Asegurar que esté en rango válido (0-1)
    RETURN GREATEST(0, LEAST(1, total_score));
END;
$$ LANGUAGE plpgsql;

-- Función para obtener los mejores modelos para un usuario y contexto
CREATE OR REPLACE FUNCTION get_recommended_models(
    p_user_id TEXT,
    p_task_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
    model_name TEXT,
    provider TEXT,
    score DECIMAL,
    usage_count INTEGER,
    average_rating DECIMAL,
    success_rate DECIMAL,
    task_affinity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ump.model_name,
        ump.provider,
        calculate_model_score(p_user_id, ump.model_name, p_task_type) as score,
        ump.usage_count,
        CASE 
            WHEN ump.user_rating_count > 0 THEN ump.user_rating_sum::DECIMAL / ump.user_rating_count
            ELSE 0
        END as average_rating,
        ump.success_rate,
        COALESCE((ump.task_types->p_task_type)::INTEGER, 0) as task_affinity
    FROM user_model_preferences ump
    WHERE ump.user_id = p_user_id
    ORDER BY score DESC, usage_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de aprendizaje del usuario
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_models_used', COUNT(*),
        'total_usage_count', SUM(usage_count),
        'favorite_model', (
            SELECT model_name 
            FROM user_model_preferences 
            WHERE user_id = p_user_id 
            ORDER BY usage_count DESC 
            LIMIT 1
        ),
        'average_rating', (
            SELECT AVG(user_rating_sum::DECIMAL / NULLIF(user_rating_count, 0))
            FROM user_model_preferences 
            WHERE user_id = p_user_id AND user_rating_count > 0
        ),
        'most_common_task_type', (
            SELECT task_type
            FROM (
                SELECT jsonb_object_keys(task_types) as task_type, 
                       MAX((task_types->>jsonb_object_keys(task_types))::INTEGER) as count
                FROM user_model_preferences 
                WHERE user_id = p_user_id AND task_types IS NOT NULL AND task_types != '{}'::jsonb
                GROUP BY jsonb_object_keys(task_types)
                ORDER BY count DESC
                LIMIT 1
            ) t
        ),
        'learning_confidence', (
            SELECT AVG(LEAST(usage_count / 50.0, 1.0))
            FROM user_model_preferences 
            WHERE user_id = p_user_id
        ),
        'last_activity', (
            SELECT MAX(last_used_at)
            FROM user_model_preferences 
            WHERE user_id = p_user_id
        )
    ) INTO result
    FROM user_model_preferences
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(result, json_build_object(
        'total_models_used', 0,
        'total_usage_count', 0,
        'favorite_model', null,
        'average_rating', null,
        'most_common_task_type', null,
        'learning_confidence', 0,
        'last_activity', null
    ));
END;
$$ LANGUAGE plpgsql;

-- Función de utilidad para limpiar datos antiguos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_learning_data(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar feedback muy antiguo
    DELETE FROM user_model_feedback 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Resetear contadores para modelos no usados recientemente
    UPDATE user_model_preferences 
    SET usage_count = GREATEST(1, usage_count / 2),
        user_rating_sum = GREATEST(0, user_rating_sum / 2),
        user_rating_count = GREATEST(0, user_rating_count / 2)
    WHERE last_used_at < NOW() - INTERVAL '1 day' * (days_old / 2);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 Funciones de aprendizaje adaptativo creadas exitosamente!';
    RAISE NOTICE '📋 Funciones disponibles:';
    RAISE NOTICE '   - upsert_model_usage(): Registra uso de modelos';
    RAISE NOTICE '   - update_model_rating(): Actualiza calificaciones';
    RAISE NOTICE '   - calculate_model_score(): Calcula puntuación personalizada';
    RAISE NOTICE '   - get_recommended_models(): Obtiene recomendaciones';
    RAISE NOTICE '   - get_user_learning_stats(): Estadísticas del usuario';
    RAISE NOTICE '   - cleanup_old_learning_data(): Limpieza de datos antiguos';
END $$;