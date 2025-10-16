const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jmfegokyvaflwegtyaun.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function createBasicLearningFunction() {
  console.log('🔧 CREANDO FUNCIÓN BÁSICA DE APRENDIZAJE');
  console.log('======================================');

  try {
    // Crear función simple para obtener estadísticas
    const simpleFunction = `
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
                      'total_cost', total_cost
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
    `;

    console.log('📤 Enviando función a Supabase...');
    
    // Probar ejecutando la función como una query
    const { data, error } = await supabase
      .from('user_model_preferences')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return;
    }

    console.log('✅ Conexión a Supabase exitosa');
    console.log('📝 Para instalar las funciones, ejecuta este SQL en el dashboard de Supabase:');
    console.log('='.repeat(80));
    console.log(simpleFunction);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBasicLearningFunction();