const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jmfegokyvaflwegtyaun.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function checkPlans() {
    console.log('🔍 VERIFICANDO PLANES Y MODELOS DISPONIBLES');
    console.log('==========================================');

    try {
        // Obtener todos los planes
        const { data: plans, error: plansError } = await supabase
            .from('plan_limits')
            .select('*')
            .order('price_eur', { ascending: true });

        if (plansError) {
            console.error('❌ Error fetching plans:', plansError.message);
            return;
        }

        console.log('📋 Planes disponibles:');
        plans.forEach(plan => {
            console.log(`\n📦 ${plan.plan_name.toUpperCase()}`);
            console.log(`   💰 Precio: €${plan.price_eur}/mes`);
            console.log(`   📊 Límite mensual: ${plan.monthly_request_limit} requests`);
            console.log(`   🤖 Modelos permitidos: ${plan.allowed_models.length}`);
            console.log(`   🔹 ${plan.allowed_models.join(', ')}`);

            // Verificar si gemini-2.0-flash está incluido
            const hasGemini2 = plan.allowed_models.includes('gemini-2.0-flash');
            console.log(`   🎯 gemini-2.0-flash: ${hasGemini2 ? '✅ SÍ' : '❌ NO'}`);
        });

        // Verificar plan específico del usuario
        console.log('\n🔍 VERIFICANDO PLAN STARTER ESPECÍFICAMENTE...');
        const starterPlan = plans.find(p => p.plan_name === 'starter');
        if (starterPlan) {
            console.log(`✅ Plan starter encontrado:`);
            console.log(`   Modelos: ${starterPlan.allowed_models.join(', ')}`);
            console.log(`   gemini-2.0-flash incluido: ${starterPlan.allowed_models.includes('gemini-2.0-flash') ? 'SÍ' : 'NO'}`);
        } else {
            console.log('❌ Plan starter no encontrado');
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

checkPlans();