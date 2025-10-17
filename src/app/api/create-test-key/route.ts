import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        // Crear una API key de prueba
        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .insert({
                user_id: 'user_33t2Znh2CEyo72pUNBXLCPOiIvK',
                name: 'Test API Key Together v2',
                key_hash: 'rtr_test_together_12345678901234567890123456789012345678901234567890',
                is_active: true
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({
                error: 'Error creating API key',
                details: error.message,
                code: error.code
            });
        }

        return NextResponse.json({
            success: true,
            message: 'API key created successfully',
            apiKey: data
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}