import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        // Actualizar las preferencias del usuario para incluir openai
        const { data, error } = await supabaseAdmin
            .from('user_settings')
            .update({
                settings: {
                    theme: 'light',
                    language: 'en',
                    compactView: true,
                    usageAlerts: true,
                    defaultModel: 'gpt-4o-mini',
                    weeklyReports: false,
                    emailNotifications: true,
                    preferredProviders: ['openai', 'meta'], // Ahora incluye ambos
                    usageAlertThreshold: 80
                },
                updated_at: new Date().toISOString()
            })
            .eq('user_id', 'user_33t2Znh2CEyo72pUNBXLCPOiIvK')
            .select()
            .single();

        if (error) {
            return NextResponse.json({
                error: 'Error updating settings',
                details: error.message,
                code: error.code
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated to include OpenAI and Meta',
            updatedSettings: data
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}