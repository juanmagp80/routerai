const { createClient } = require('@supabase/supabase-js');
const { randomBytes } = require('crypto');

// Configuración de Supabase (usará las variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener configurado:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleData(userId) {
  try {
    console.log(`📝 Insertando datos de ejemplo para usuario: ${userId}`);

    // 1. Insertar API Key de ejemplo
    const apiKeyValue = `rtr_${randomBytes(16).toString('hex')}`;
    
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name: 'Clave Principal',
        key_value: apiKeyValue,
        is_active: true,
      })
      .select()
      .single();

    if (apiKeyError) {
      console.error('❌ Error insertando API key:', apiKeyError);
      return;
    }

    console.log('✅ API Key creada:', apiKey.name);

    // 2. Insertar registros de uso de ejemplo
    const sampleUsageRecords = [
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'gpt-4',
        input_tokens: 150,
        output_tokens: 300,
        cost: 0.025,
        request_data: { prompt: '¿Cómo funciona la IA?' },
        response_data: { response: 'La inteligencia artificial es una rama de la informática...' },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
      },
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'claude-3-sonnet',
        input_tokens: 200,
        output_tokens: 400,
        cost: 0.030,
        request_data: { prompt: 'Explica el machine learning' },
        response_data: { response: 'El machine learning es un subconjunto de la IA...' },
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 horas atrás
      },
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'gpt-3.5-turbo',
        input_tokens: 100,
        output_tokens: 250,
        cost: 0.015,
        request_data: { prompt: 'Resumen del proyecto' },
        response_data: { response: 'El proyecto RouterAI es una plataforma...' },
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 día atrás
      },
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'gpt-4',
        input_tokens: 180,
        output_tokens: 350,
        cost: 0.028,
        request_data: { prompt: 'Análisis de datos con Python' },
        response_data: { response: 'Para realizar análisis de datos en Python...' },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 días atrás
      },
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'claude-3-haiku',
        input_tokens: 120,
        output_tokens: 200,
        cost: 0.012,
        request_data: { prompt: 'Genera código Python para conectar a API' },
        response_data: { response: '```python\nimport requests\n\ndef call_api():...' },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días atrás
      },
      {
        user_id: userId,
        api_key_id: apiKey.id,
        model_used: 'gpt-4',
        input_tokens: 220,
        output_tokens: 450,
        cost: 0.035,
        request_data: { prompt: 'Mejores prácticas de desarrollo web' },
        response_data: { response: 'Las mejores prácticas en desarrollo web incluyen...' },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 días atrás
      }
    ];

    const { data: usageRecords, error: usageError } = await supabase
      .from('usage_records')
      .insert(sampleUsageRecords);

    if (usageError) {
      console.error('❌ Error insertando registros de uso:', usageError);
      return;
    }

    console.log(`✅ ${sampleUsageRecords.length} registros de uso insertados`);
    console.log('✅ Datos de ejemplo insertados correctamente');
    
    // Mostrar resumen
    const totalCost = sampleUsageRecords.reduce((sum, record) => sum + record.cost, 0);
    const totalCalls = sampleUsageRecords.length;
    const uniqueModels = new Set(sampleUsageRecords.map(r => r.model_used)).size;
    
    console.log('\n📊 Resumen de datos insertados:');
    console.log(`- Total llamadas API: ${totalCalls}`);
    console.log(`- Costo total: $${totalCost.toFixed(3)}`);
    console.log(`- Modelos únicos: ${uniqueModels}`);
    console.log(`- API Keys: 1`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Debes proporcionar el ID de usuario de Clerk');
    console.log('Uso: npm run insert-sample-data <USER_ID>');
    console.log('Ejemplo: npm run insert-sample-data user_2abc123def456');
    process.exit(1);
  }

  console.log('🚀 Iniciando inserción de datos de ejemplo...');
  await insertSampleData(userId);
}

main().catch(console.error);