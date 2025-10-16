const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jmfegokyvaflwegtyaun.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function checkLearningSystem() {
  console.log('🔍 VERIFICANDO SISTEMA DE APRENDIZAJE ADAPTATIVO');
  console.log('================================================');

  try {
    // 1. Verificar tablas
    console.log('\n📋 Verificando tablas...');
    
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_model_preferences')
      .select('count(*)')
      .limit(1);
    
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('user_model_feedback')  
      .select('count(*)')
      .limit(1);

    console.log('  user_model_preferences:', prefsError ? '❌ ERROR: ' + prefsError.message : '✅ OK');
    console.log('  user_model_feedback:', feedbackError ? '❌ ERROR: ' + feedbackError.message : '✅ OK');

    // 2. Verificar funciones
    console.log('\n⚙️ Verificando funciones...');
    
    const functions = [
      'get_user_learning_stats',
      'upsert_model_usage',
      'calculate_model_score',
      'get_recommended_models'
    ];

    for (const funcName of functions) {
      try {
        const { data, error } = await supabase.rpc(funcName + '_test', {});
        console.log(`  ${funcName}:`, error ? `❌ NO EXISTE (${error.message})` : '✅ OK');
      } catch (e) {
        // Intentar con parámetros mínimos
        try {
          if (funcName === 'get_user_learning_stats') {
            const { data, error } = await supabase.rpc(funcName, { p_user_id: 'test' });
            console.log(`  ${funcName}:`, error ? `❌ ERROR: ${error.message}` : '✅ OK');
          } else {
            console.log(`  ${funcName}: ❓ NO SE PUEDE PROBAR SIN PARÁMETROS`);
          }
        } catch (e2) {
          console.log(`  ${funcName}: ❌ NO EXISTE`);
        }
      }
    }

    // 3. Test básico de datos existentes
    console.log('\n📊 Verificando datos existentes...');
    const { data: existingData, error: dataError } = await supabase
      .from('user_model_preferences')
      .select('*')
      .limit(5);

    if (dataError) {
      console.log('  ❌ Error accediendo a datos:', dataError.message);
    } else {
      console.log(`  ✅ ${existingData.length} registros encontrados`);
      if (existingData.length > 0) {
        console.log('  📝 Ejemplo:', JSON.stringify(existingData[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n================================================');
}

checkLearningSystem();