// Script para desactivar 2 API keys del usuario yomvi122@gmail.com
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deactivateOldestApiKeys() {
  console.log('🔧 Desactivando 2 API keys más antiguas...\n');

  try {
    // Buscar al usuario yomvi122@gmail.com
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('clerk_user_id', 'user_33t2Znh2CEyo72pUNBXLCPOiIvK')
      .single();

    if (userError || !user) {
      console.error('❌ Usuario no encontrado:', userError);
      return;
    }

    console.log('✅ Usuario encontrado:', user.email);

    // Obtener todas las API keys activas del usuario, ordenadas por fecha de creación
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, name, created_at, last_used_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true }); // Las más antiguas primero

    if (keysError) {
      console.error('❌ Error obteniendo API keys:', keysError);
      return;
    }

    console.log(`📊 API keys activas encontradas: ${apiKeys.length}`);

    if (apiKeys.length <= 10) {
      console.log('✅ El usuario ya tiene 10 o menos API keys activas.');
      return;
    }

    // Seleccionar las 2 más antiguas que no han sido usadas recientemente
    const keysToDeactivate = apiKeys
      .filter(key => !key.last_used_at || new Date(key.last_used_at) < new Date('2025-10-17'))
      .slice(0, 2);

    if (keysToDeactivate.length < 2) {
      // Si no hay suficientes sin uso reciente, tomar las 2 más antiguas
      keysToDeactivate.push(...apiKeys.slice(0, 2 - keysToDeactivate.length));
    }

    console.log('\n🎯 API keys seleccionadas para desactivar:');
    keysToDeactivate.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name} (creada: ${key.created_at}, último uso: ${key.last_used_at || 'nunca'})`);
    });

    // Desactivar las API keys seleccionadas
    for (const key of keysToDeactivate) {
      const { error: deactivateError } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', key.id);

      if (deactivateError) {
        console.error(`❌ Error desactivando ${key.name}:`, deactivateError);
      } else {
        console.log(`✅ Desactivada: ${key.name}`);
      }
    }

    // Verificar el resultado
    const { data: remainingKeys, count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true);

    console.log(`\n🎉 Resultado final: ${count} API keys activas (límite: 10)`);
    console.log('✅ Ahora puedes crear nuevas API keys.');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

deactivateOldestApiKeys();