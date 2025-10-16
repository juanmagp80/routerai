const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jmfegokyvaflwegtyaun.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function updatePlanModelsExpanded() {
    console.log('🚀 ACTUALIZANDO PLANES CON MODELOS EXPANDIDOS');
    console.log('=============================================');

    try {
        // Plan FREE - Modelos más económicos y eficientes
        const freeModels = [
            'gpt-3.5-turbo',
            'gpt-4o-mini',
            'claude-3-haiku',
            'claude-3.5-sonnet',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'llama-3.1-8b',
            'mistral-7b'
        ];

        const { error: freeError } = await supabase
            .from('plan_limits')
            .update({ allowed_models: freeModels })
            .eq('plan_name', 'free');

        console.log(`📦 Plan FREE (${freeModels.length} modelos):`, freeError ? `❌ ${freeError.message}` : '✅ Actualizado');

        // Plan STARTER - Balance calidad/precio
        const starterModels = [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4o-mini',
            'gpt-4o',
            'gpt-4-vision',
            'claude-3-haiku',
            'claude-3-sonnet',
            'claude-3.5-sonnet',
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'llama-3.1-8b',
            'llama-3.1-70b',
            'mixtral-8x7b',
            'mistral-7b',
            'codestral'
        ];

        const { error: starterError } = await supabase
            .from('plan_limits')
            .update({ allowed_models: starterModels })
            .eq('plan_name', 'starter');

        console.log(`📦 Plan STARTER (${starterModels.length} modelos):`, starterError ? `❌ ${starterError.message}` : '✅ Actualizado');

        // Plan PRO - Modelos premium y especializados
        const proModels = [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4-32k',
            'gpt-4o-mini',
            'gpt-4o',
            'gpt-4-vision',
            'o1-preview',
            'o1-mini',
            'claude-3-haiku',
            'claude-3-sonnet',
            'claude-3-opus',
            'claude-3.5-sonnet',
            'claude-3.5-opus',
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-ultra',
            'llama-3.1-8b',
            'llama-3.1-70b',
            'llama-3.1-405b',
            'mixtral-8x7b',
            'mistral-7b',
            'codestral',
            'grok-beta',
            'grok-2',
            'command-r',
            'command-r-plus'
        ];

        const { error: proError } = await supabase
            .from('plan_limits')
            .update({ allowed_models: proModels })
            .eq('plan_name', 'pro');

        console.log(`📦 Plan PRO (${proModels.length} modelos):`, proError ? `❌ ${proError.message}` : '✅ Actualizado');

        // Plan ENTERPRISE - Acceso completo a todos los modelos
        const enterpriseModels = [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4-32k',
            'gpt-4o-mini',
            'gpt-4o',
            'gpt-4-vision',
            'o1-preview',
            'o1-mini',
            'claude-3-haiku',
            'claude-3-sonnet',
            'claude-3-opus',
            'claude-3.5-sonnet',
            'claude-3.5-opus',
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-ultra',
            'llama-3.1-8b',
            'llama-3.1-70b',
            'llama-3.1-405b',
            'llama-3.2-3b',
            'llama-3.2-90b',
            'mixtral-8x7b',
            'mistral-7b',
            'mistral-small',
            'codestral',
            'codellama-34b',
            'deepseek-coder',
            'starcoder2',
            'grok-beta',
            'grok-2',
            'command-r',
            'command-r-plus',
            'pplx-7b-online',
            'pplx-70b-online',
            'stable-beluga',
            'stable-code',
            'zephyr-7b',
            'falcon-180b'
        ];

        const { error: enterpriseError } = await supabase
            .from('plan_limits')
            .update({ allowed_models: enterpriseModels })
            .eq('plan_name', 'enterprise');

        console.log(`📦 Plan ENTERPRISE (${enterpriseModels.length} modelos):`, enterpriseError ? `❌ ${enterpriseError.message}` : '✅ Actualizado');

        // Verificar resultados finales
        console.log('\n🔍 VERIFICANDO RESULTADOS FINALES...');
        const { data: updatedPlans, error: verifyError } = await supabase
            .from('plan_limits')
            .select('*')
            .order('price_eur', { ascending: true });

        if (verifyError) {
            console.error('❌ Error verificando:', verifyError.message);
            return;
        }

        console.log('\n📊 RESUMEN DE MODELOS POR PLAN:');
        updatedPlans.forEach(plan => {
            console.log(`\n📦 ${plan.plan_name.toUpperCase()}`);
            console.log(`   💰 Precio: €${plan.price_eur}/mes`);
            console.log(`   🤖 Total modelos: ${plan.allowed_models.length}`);
            console.log(`   🎯 gemini-2.0-flash: ${plan.allowed_models.includes('gemini-2.0-flash') ? '✅' : '❌'}`);
            console.log(`   🔥 gpt-4: ${plan.allowed_models.includes('gpt-4') ? '✅' : '❌'}`);
            console.log(`   ⚡ llama-3.1-70b: ${plan.allowed_models.includes('llama-3.1-70b') ? '✅' : '❌'}`);
            console.log(`   🧠 claude-3-opus: ${plan.allowed_models.includes('claude-3-opus') ? '✅' : '❌'}`);

            // Mostrar algunos modelos como ejemplo
            const examples = plan.allowed_models.slice(0, 5).join(', ');
            console.log(`   📝 Ejemplos: ${examples}${plan.allowed_models.length > 5 ? '...' : ''}`);
        });

        console.log('\n🎉 ¡ACTUALIZACIÓN EXPANDIDA COMPLETADA!');
        console.log('🚀 Tu plataforma ahora soporta más de 40 modelos diferentes');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

updatePlanModelsExpanded();