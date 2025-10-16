-- Función para insertar o actualizar el uso de un modelo
CREATE OR REPLACE FUNCTION upsert_model_usage(
    p_user_id TEXT, -- Cambiar a TEXT para compatibilidad con Clerk
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
DECLARE
    current_task_types JSONB;
    current_time_prefs JSONB;
    current_message_prefs JSONB;
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
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el rating de un modelo
CREATE OR REPLACE FUNCTION update_model_rating(
    p_user_id TEXT, -- Cambiar a TEXT para compatibilidad con Clerk
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
END;
$$ LANGUAGE plpgsql;

-- Función para obtener los mejores modelos para un usuario y contexto
CREATE OR REPLACE FUNCTION get_recommended_models(
    p_user_id TEXT, -- Cambiar a TEXT para compatibilidad con Clerk
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
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id TEXT) -- Cambiar a TEXT para compatibilidad con Clerk
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
                WHERE user_id = p_user_id AND task_types IS NOT NULL
                GROUP BY jsonb_object_keys(task_types)
                ORDER BY count DESC
                LIMIT 1
            ) t
        ),
        'learning_confidence', (
            SELECT AVG(usage_count / 50.0)
            FROM user_model_preferences 
            WHERE user_id = p_user_id
        )
    ) INTO result
    FROM user_model_preferences
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;