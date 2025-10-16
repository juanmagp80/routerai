import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Testing learning system for user:', userId);

    // Test 1: Verificar que las tablas existen intentando acceder a ellas
    const tablesExist = {
      preferences: false,
      feedback: false
    };
    
    try {
      const { error: prefsTableError } = await supabase
        .from('user_model_preferences')
        .select('id')
        .limit(1);
      
      tablesExist.preferences = !prefsTableError;
      
      const { error: feedbackTableError } = await supabase
        .from('user_model_feedback')
        .select('id')
        .limit(1);
      
      tablesExist.feedback = !feedbackTableError;
      
      console.log('🔍 Tables verification:', { tablesExist, prefsTableError, feedbackTableError });
      
    } catch (error) {
      console.error('❌ Error checking tables:', error);
      return NextResponse.json({ 
        error: 'Tables verification failed', 
        details: error 
      }, { status: 500 });
    }

    // Test 2: Verificar si existen datos para este usuario
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_model_preferences')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    if (prefsError) {
      console.error('❌ Error fetching user preferences:', prefsError);
    }

    // Test 3: Intentar crear datos de prueba si no existen
    if (!userPrefs || userPrefs.length === 0) {
      console.log('🔧 No data found, creating test data...');
      
      const { error: insertError } = await supabase
        .from('user_model_preferences')
        .insert({
          user_id: userId,
          model_name: 'gpt-4o-mini',
          provider: 'openai',
          usage_count: 1,
          total_tokens_used: 1000,
          total_cost: 0.01,
          average_response_time: 2500,
          manual_selections_count: 0,
          user_rating_sum: 0,
          user_rating_count: 0,
          task_types: { 'coding': 1 },
          success_rate: 1.0,
          error_count: 0
        });

      if (insertError) {
        console.error('❌ Error inserting test data:', insertError);
      } else {
        console.log('✅ Test data created successfully');
      }
    }

    // Test 4: Intentar obtener estadísticas básicas
    const { data: finalPrefs, error: finalError } = await supabase
      .from('user_model_preferences')
      .select('*')
      .eq('user_id', userId);

    const result = {
      userId,
      tablesExist,
      userPreferences: finalPrefs?.length || 0,
      sampleData: finalPrefs?.slice(0, 2) || [],
      testPassed: tablesExist.preferences && tablesExist.feedback && !finalError
    };

    console.log('✅ Test completed:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}