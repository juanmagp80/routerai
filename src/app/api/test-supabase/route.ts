import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Test simple de conexión a Supabase
export async function GET() {
  try {
    // Test 1: Verificar si supabaseAdmin existe
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'supabaseAdmin is null',
        env: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
          key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
        }
      });
    }

    // Test 2: Hacer una consulta simple
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection working',
      result: data
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}