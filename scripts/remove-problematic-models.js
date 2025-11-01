#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeProblematicModels() {
  try {
    console.log('🧹 Removing problematic models from plan_limits...');

    // Get all plans
    const { data: plans, error: fetchError } = await supabase
      .from('plan_limits')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    console.log(`📋 Found ${plans.length} plans to update`);

    for (const plan of plans) {
      let allowedModels = plan.allowed_models || [];
      const originalCount = allowedModels.length;

      // Remove problematic models
      allowedModels = allowedModels.filter(model =>
        model !== 'o1-preview' &&
        model !== 'o1-mini' &&
        model !== 'gemini-ultra'
      );

      if (allowedModels.length !== originalCount) {
        console.log(`🔧 Updating ${plan.plan_name}: ${originalCount} → ${allowedModels.length} models`);

        const { error: updateError } = await supabase
          .from('plan_limits')
          .update({ allowed_models: allowedModels })
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
      console.log(`  ${plan.plan_name}: ${plan.allowed_models.length} models`);
      console.log(`    ${plan.allowed_models.join(', ')}`);
    });

    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeProblematicModels();