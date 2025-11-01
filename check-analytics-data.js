const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserData() {
  console.log('=== VERIFICANDO DATOS DEL USUARIO yomvi122@gmail.com ===');
  
  // Buscar usuario
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'yomvi122@gmail.com')
    .single();
    
  if (userError) {
    console.log('Error buscando usuario:', userError);
    return;
  }
  
  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }
  
  console.log('Usuario encontrado:', {
    id: user.id,
    email: user.email,
    plan: user.plan,
    company: user.company
  });
  
  // Verificar API keys del usuario
  const { data: apiKeys, error: apiError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id);
    
  console.log('\n=== API KEYS DEL USUARIO ===');
  console.log('Número de API keys:', apiKeys?.length || 0);
  if (apiKeys && apiKeys.length > 0) {
    apiKeys.forEach((key, index) => {
      console.log(`API Key ${index + 1}:`, {
        id: key.id,
        name: key.name,
        is_active: key.is_active,
        created_at: key.created_at
      });
    });
  }
  
  // Verificar usage records
  const { data: usageRecords, error: usageError } = await supabase
    .from('usage_records')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  console.log('\n=== USAGE RECORDS ===');
  console.log('Total usage records:', usageRecords?.length || 0);
  
  if (usageRecords && usageRecords.length > 0) {
    console.log('Últimos 10 records:');
    usageRecords.slice(0, 10).forEach((record, index) => {
      console.log(`Record ${index + 1}:`, {
        id: record.id,
        model_used: record.model_used,
        input_tokens: record.input_tokens,
        output_tokens: record.output_tokens,
        cost: record.cost,
        created_at: record.created_at
      });
    });
    
    // Calcular totales
    const totalCost = usageRecords.reduce((sum, record) => sum + (parseFloat(record.cost) || 0), 0);
    const totalRequests = usageRecords.length;
    const totalInputTokens = usageRecords.reduce((sum, record) => sum + (record.input_tokens || 0), 0);
    const totalOutputTokens = usageRecords.reduce((sum, record) => sum + (record.output_tokens || 0), 0);
    
    console.log('\n=== TOTALES ===');
    console.log('Total requests:', totalRequests);
    console.log('Total cost:', totalCost.toFixed(6));
    console.log('Total input tokens:', totalInputTokens);
    console.log('Total output tokens:', totalOutputTokens);
    
    // Verificar costos por modelo
    const costsByModel = {};
    usageRecords.forEach(record => {
      const modelName = record.model_used || 'unknown';
      if (!costsByModel[modelName]) {
        costsByModel[modelName] = {
          count: 0,
          totalCost: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0
        };
      }
      costsByModel[modelName].count++;
      costsByModel[modelName].totalCost += parseFloat(record.cost) || 0;
      costsByModel[modelName].totalInputTokens += record.input_tokens || 0;
      costsByModel[modelName].totalOutputTokens += record.output_tokens || 0;
    });
    
    console.log('\n=== COSTOS POR MODELO ===');
    Object.entries(costsByModel).forEach(([model, stats]) => {
      console.log(`${model}:`, {
        requests: stats.count,
        totalCost: stats.totalCost.toFixed(6),
        avgCost: (stats.totalCost / stats.count).toFixed(6),
        totalInputTokens: stats.totalInputTokens,
        totalOutputTokens: stats.totalOutputTokens
      });
    });
  }
  
  // Verificar límites del plan
  const { data: planLimits, error: planError } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan_name', user.plan)
    .single();
    
  console.log('\n=== LÍMITES DEL PLAN ===');
  if (planLimits) {
    console.log('Plan limits:', {
      plan_name: planLimits.plan_name,
      monthly_request_limit: planLimits.monthly_request_limit,
      api_key_limit: planLimits.api_key_limit,
      allowed_models: planLimits.allowed_models?.slice(0, 5) // Solo mostrar los primeros 5
    });
    
    // Verificar si el usuario ha excedido los límites
    const requestsThisMonth = usageRecords?.length || 0;
    console.log('\nComparación con límites:');
    console.log(`Requests este mes: ${requestsThisMonth}`);
    console.log(`Límite mensual: ${planLimits.monthly_request_limit}`);
    console.log(`¿Ha excedido?: ${requestsThisMonth > planLimits.monthly_request_limit ? 'SÍ' : 'NO'}`);
    console.log(`Porcentaje usado: ${((requestsThisMonth / planLimits.monthly_request_limit) * 100).toFixed(1)}%`);
  } else {
    console.log('No se encontraron límites para el plan:', user.plan);
  }
}

checkUserData().catch(console.error);