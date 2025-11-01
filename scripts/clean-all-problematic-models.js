#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Lista de modelos problemáticos que no están disponibles o requieren acceso especial
const PROBLEMATIC_MODELS = [
  'o1-preview',
  'o1-mini',
  'gemini-ultra',
  'gpt-4-32k',
  'claude-3.5-opus', // Este modelo puede no estar disponible aún
  'llama-3.1-405b',  // Modelo muy grande, puede no estar disponible
  'llama-3.2-90b',   // Similar
  'command-r',       // Cohere models pueden no estar disponibles
  'command-r-plus',
  'pplx-7b-online',  // Perplexity models
  'pplx-70b-online',
  'stable-beluga',   // StabilityAI models pueden no estar disponibles
  'stable-code',
  'deepseek-coder',  // DeepSeek puede no estar disponible
  'starcoder2',      // StarCoder puede no estar disponible
  'codellama-34b',   // Modelo muy grande
  'zephyr-7b',       // HuggingFace models pueden no estar disponibles
  'falcon-180b'      // Modelo muy grande
];

async function cleanAllProblematicModels() {
  try {
    console.log('🧹 Cleaning all problematic models from plan_limits...');
    console.log(`🚫 Models to remove: ${PROBLEMATIC_MODELS.join(', ')}`);

    // Get all plans
    const { data: plans, error: fetchError } = await supabase
      .from('plan_limits')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    console.log(`📋 Found ${plans.length} plans to clean`);

    for (const plan of plans) {
      let allowedModels = plan.allowed_models || [];
      const originalCount = allowedModels.length;
      const removedModels = [];

      // Remove problematic models
      const cleanedModels = allowedModels.filter(model => {
        if (PROBLEMATIC_MODELS.includes(model)) {
          removedModels.push(model);
          return false;
        }
        return true;
      });

      if (cleanedModels.length !== originalCount) {
        console.log(`🔧 Cleaning ${plan.plan_name}:`);
        console.log(`   Removed: ${removedModels.join(', ')}`);
        console.log(`   Count: ${originalCount} → ${cleanedModels.length} models`);
        
        const { error: updateError } = await supabase
          .from('plan_limits')
          .update({ allowed_models: cleanedModels })
          .eq('plan_name', plan.plan_name);

        if (updateError) {
          console.error(`❌ Error updating ${plan.plan_name}:`, updateError);
        } else {
          console.log(`✅ Updated ${plan.plan_name}`);
        }
      } else {
        console.log(`✓ ${plan.plan_name} already clean`);
      }
    }

    // Show final results
    console.log('\n📊 Final plan configurations:');
    const { data: updatedPlans } = await supabase
      .from('plan_limits')
      .select('plan_name, allowed_models')
      .order('plan_name');

    updatedPlans.forEach(plan => {
      console.log(`\n  ${plan.plan_name.toUpperCase()}: ${plan.allowed_models.length} models`);
      
      // Group models by provider for better readability
      const modelsByProvider = {};
      plan.allowed_models.forEach(model => {
        const provider = getProviderFromModel(model);
        if (!modelsByProvider[provider]) {
          modelsByProvider[provider] = [];
        }
        modelsByProvider[provider].push(model);
      });

      Object.entries(modelsByProvider).forEach(([provider, models]) => {
        console.log(`    ${provider}: ${models.join(', ')}`);
      });
    });

    console.log('\n✅ Cleanup completed! Only available models remain.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function getProviderFromModel(modelName) {
  if (modelName.startsWith('gpt-')) return 'OpenAI';
  if (modelName.startsWith('claude-')) return 'Anthropic';
  if (modelName.startsWith('gemini-')) return 'Google';
  if (modelName.startsWith('llama-')) return 'Meta';
  if (modelName.startsWith('mixtral-') || modelName.startsWith('mistral-') || modelName.includes('codestral')) return 'Mistral';
  if (modelName.startsWith('grok-')) return 'xAI';
  return 'Other';
}

cleanAllProblematicModels();