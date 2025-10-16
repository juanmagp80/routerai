-- Script de verificación del sistema de aprendizaje adaptativo
-- Ejecutar después de la instalación para verificar que todo funciona

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO INSTALACIÓN DEL SISTEMA DE APRENDIZAJE ADAPTATIVO';
    RAISE NOTICE '================================================================';
    
    -- Verificar tablas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_model_preferences', 'user_model_feedback');
    
    RAISE NOTICE '📋 TABLAS: % de 2 encontradas', table_count;
    
    IF table_count = 2 THEN
        RAISE NOTICE '  ✅ user_model_preferences: OK';
        RAISE NOTICE '  ✅ user_model_feedback: OK';
    ELSE
        RAISE NOTICE '  ❌ Faltan tablas por crear';
    END IF;
    
    -- Verificar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_user_model_%';
    
    RAISE NOTICE '📊 ÍNDICES: % encontrados', index_count;
    
    -- Verificar funciones
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
        'upsert_model_usage', 
        'update_model_rating', 
        'calculate_model_score', 
        'get_recommended_models', 
        'get_user_learning_stats'
    );
    
    RAISE NOTICE '⚙️  FUNCIONES: % de 5 encontradas', function_count;
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name = 'update_user_model_preferences_updated_at';
    
    RAISE NOTICE '🔧 TRIGGERS: % encontrados', trigger_count;
    
    -- Resumen final
    RAISE NOTICE '================================================================';
    IF table_count = 2 AND function_count = 5 AND trigger_count = 1 THEN
        RAISE NOTICE '🎉 INSTALACIÓN COMPLETA Y EXITOSA!';
        RAISE NOTICE '📱 El sistema de aprendizaje adaptativo está listo para usar';
    ELSE
        RAISE NOTICE '⚠️  INSTALACIÓN INCOMPLETA';
        RAISE NOTICE '📋 Faltantes:';
        IF table_count < 2 THEN
            RAISE NOTICE '   - Ejecutar install-adaptive-learning.sql';
        END IF;
        IF function_count < 5 THEN
            RAISE NOTICE '   - Ejecutar create-learning-functions-fixed.sql';
        END IF;
        IF trigger_count < 1 THEN
            RAISE NOTICE '   - Verificar creación de triggers';
        END IF;
    END IF;
    
    RAISE NOTICE '================================================================';
END $$;

-- Test básico de funcionalidad (con datos de ejemplo)
DO $$
DECLARE
    test_user_id TEXT := 'test_user_123';
    test_result JSON;
BEGIN
    RAISE NOTICE '🧪 EJECUTANDO TESTS BÁSICOS';
    RAISE NOTICE '================================';
    
    -- Test 1: Insertar datos de prueba
    BEGIN
        PERFORM upsert_model_usage(
            test_user_id, 
            'gpt-4o-mini', 
            'openai', 
            1000, 
            0.01, 
            2500, 
            false, 
            true, 
            'coding'
        );
        RAISE NOTICE '✅ Test 1: upsert_model_usage - OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Test 1: upsert_model_usage - ERROR: %', SQLERRM;
    END;
    
    -- Test 2: Calcular score
    BEGIN
        SELECT calculate_model_score(test_user_id, 'gpt-4o-mini', 'coding') INTO test_result;
        RAISE NOTICE '✅ Test 2: calculate_model_score - OK (Score: %)', test_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Test 2: calculate_model_score - ERROR: %', SQLERRM;
    END;
    
    -- Test 3: Obtener estadísticas
    BEGIN
        SELECT get_user_learning_stats(test_user_id) INTO test_result;
        RAISE NOTICE '✅ Test 3: get_user_learning_stats - OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Test 3: get_user_learning_stats - ERROR: %', SQLERRM;
    END;
    
    -- Limpiar datos de prueba
    DELETE FROM user_model_preferences WHERE user_id = test_user_id;
    DELETE FROM user_model_feedback WHERE user_id = test_user_id;
    
    RAISE NOTICE '🧹 Datos de prueba limpiados';
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ TODOS LOS TESTS COMPLETADOS';
END $$;