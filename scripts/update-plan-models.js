const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jmfegokyvaflwegtyaun.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function updatePlanModels() {
  console.log('🔧 ACTUALIZANDO MODELOS DE TODOS LOS PLANES');
  console.log('==========================================');

  try {
    // Plan FREE
    const { error: freeError } = await supabase
      .from('plan_limits')
      .update({
        allowed_models: [
          'gpt-3.5-turbo', 
          'gpt-4o-mini', 
          'claude-3-haiku', 
          'gemini-2.0-flash',
          'gemini-2.5-flash'
        ]
      })
      .eq('plan_name', 'free');

    console.log('📦 Plan FREE:', freeError ? `❌ ${freeError.message}` : '✅ Actualizado');

    // Plan STARTER
    const { error: starterError } = await supabase
      .from('plan_limits')
      .update({
        allowed_models: [
          'gpt-3.5-turbo',
          'gpt-4',
          'gpt-4o-mini',
          'gpt-4o',
          'claude-3-haiku',
          'claude-3-sonnet',
          'gemini-pro',
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-2.5-pro'
        ]
      })
      .eq('plan_name', 'starter');

    console.log('📦 Plan STARTER:', starterError ? `❌ ${starterError.message}` : '✅ Actualizado');

    // Plan PRO
    const { error: proError } = await supabase
      .from('plan_limits')
      .update({
        allowed_models: [
          'gpt-3.5-turbo',
          'gpt-4',
          'gpt-4-turbo',
          'gpt-4o-mini',
          'gpt-4o',
          'claude-3-haiku',
          'claude-3-sonnet',
          'claude-3-opus',
          'gemini-pro',
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
          'grok-beta'
        ]
      })
      .eq('plan_name', 'pro');

    console.log('📦 Plan PRO:', proError ? `❌ ${proError.message}` : '✅ Actualizado');

    // Plan ENTERPRISE
    const { error: enterpriseError } = await supabase
      .from('plan_limits')
      .update({
        allowed_models: [
          'gpt-3.5-turbo',
          'gpt-4',
          'gpt-4-turbo',
          'gpt-4o-mini',
          'gpt-4o',
          'claude-3-haiku',
          'claude-3-sonnet',
          'claude-3-opus',
          'gemini-pro',
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
          'grok-beta'
        ]
      })
      .eq('plan_name', 'enterprise');

    console.log('📦 Plan ENTERPRISE:', enterpriseError ? `❌ ${enterpriseError.message}` : '✅ Actualizado');

    // Verificar resultados
    console.log('\n🔍 VERIFICANDO RESULTADOS...');
    const { data: updatedPlans, error: verifyError } = await supabase
      .from('plan_limits')
      .select('*')
      .order('price_eur', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError.message);
      return;
    }

    updatedPlans.forEach(plan => {
      const hasGemini2 = plan.allowed_models.includes('gemini-2.0-flash');
      console.log(`\n📦 ${plan.plan_name.toUpperCase()}`);
      console.log(`   🤖 Modelos: ${plan.allowed_models.length}`);
      console.log(`   🎯 gemini-2.0-flash: ${hasGemini2 ? '✅ SÍ' : '❌ NO'}`);
    });

    console.log('\n🎉 ¡ACTUALIZACIÓN COMPLETADA!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updatePlanModels();