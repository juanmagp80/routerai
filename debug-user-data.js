// Script para diagnosticar datos del usuario en la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserData() {
  console.log('🔍 Diagnosticando datos del usuario...\n');

  try {
    // 1. Verificar usuarios en la base de datos
    console.log('1. USUARIOS EN LA BASE DE DATOS:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return;
    }

    console.log(`Total usuarios: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`Usuario ${index + 1}:`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Clerk ID: ${user.clerk_user_id}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Nombre: ${user.name}`);
      console.log(`  - Plan: ${user.plan}`);
      console.log(`  - Creado: ${user.created_at}`);
      console.log('');
    });

    // 2. Verificar usage_records
    console.log('2. REGISTROS DE USO (usage_records):');
    const { data: usageRecords, error: usageError } = await supabase
      .from('usage_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usageError) {
      console.error('Error obteniendo usage_records:', usageError);
    } else {
      console.log(`Total registros recientes: ${usageRecords.length}`);
      usageRecords.forEach((record, index) => {
        console.log(`Registro ${index + 1}:`);
        console.log(`  - ID: ${record.id}`);
        console.log(`  - User ID: ${record.user_id}`);
        console.log(`  - Modelo: ${record.model_used}`);
        console.log(`  - Costo: ${record.cost}`);
        console.log(`  - Tokens entrada: ${record.input_tokens}`);
        console.log(`  - Tokens salida: ${record.output_tokens}`);
        console.log(`  - Fecha: ${record.created_at}`);
        console.log('');
      });
    }

    // 3. Verificar API keys
    console.log('3. API KEYS:');
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('*');

    if (keysError) {
      console.error('Error obteniendo API keys:', keysError);
    } else {
      console.log(`Total API keys: ${apiKeys.length}`);
      apiKeys.forEach((key, index) => {
        console.log(`API Key ${index + 1}:`);
        console.log(`  - ID: ${key.id}`);
        console.log(`  - User ID: ${key.user_id}`);
        console.log(`  - Nombre: ${key.name}`);
        console.log(`  - Activa: ${key.is_active}`);
        console.log(`  - Creada: ${key.created_at}`);
        console.log('');
      });
    }

    // 4. Verificar relación entre users y usage_records
    console.log('4. ANÁLISIS DE RELACIONES:');
    if (users.length > 0 && usageRecords.length > 0) {
      console.log('Verificando si los user_id en usage_records coinciden con los usuarios:');

      const userIds = users.map(u => u.id);
      const clerkIds = users.map(u => u.clerk_user_id);
      const usageUserIds = [...new Set(usageRecords.map(r => r.user_id))];

      console.log('IDs de usuarios en tabla users (database ID):', userIds);
      console.log('Clerk IDs en tabla users:', clerkIds);
      console.log('User IDs en usage_records:', usageUserIds);

      // Verificar coincidencias
      const matchesDbId = usageUserIds.some(id => userIds.includes(id));
      const matchesClerkId = usageUserIds.some(id => clerkIds.includes(id));

      console.log(`¿Usage records usan database ID? ${matchesDbId}`);
      console.log(`¿Usage records usan Clerk ID? ${matchesClerkId}`);
    }

    // 5. Verificar plan_limits
    console.log('5. LÍMITES DE PLANES:');
    const { data: planLimits, error: limitsError } = await supabase
      .from('plan_limits')
      .select('*');

    if (limitsError) {
      console.error('Error obteniendo plan_limits:', limitsError);
    } else {
      console.log(`Total planes configurados: ${planLimits.length}`);
      planLimits.forEach((plan, index) => {
        console.log(`Plan ${index + 1}:`);
        console.log(`  - Nombre: ${plan.plan_name}`);
        console.log(`  - Límite mensual: ${plan.monthly_request_limit}`);
        console.log(`  - Límite API keys: ${plan.api_key_limit}`);
        console.log(`  - Modelos permitidos: ${plan.allowed_models?.length || 0}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error en el diagnóstico:', error);
  }
}

debugUserData();