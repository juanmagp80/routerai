import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Testing user_settings table...');

        // Test 1: Verificar si la tabla existe
        const { error: tablesError } = await supabase
            .from('user_settings')
            .select('*')
            .limit(1);

        if (tablesError) {
            console.error('Table access error:', tablesError);
            return NextResponse.json({
                error: 'Table access failed',
                details: tablesError,
                step: 'table_access'
            }, { status: 500 });
        }

        // Test 2: Intentar insertar sin RLS
        const testUserId = 'test_user_123';
        const testSettings = {
            defaultModel: 'gpt-4o-mini',
            theme: 'light'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('user_settings')
            .upsert({
                user_id: testUserId,
                settings: testSettings,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({
                error: 'Insert failed',
                details: insertError,
                step: 'insert_test'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'user_settings table is working!',
            testData: insertData
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}