import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const userId = "user_33t2Znh2CEyo72pUNBXLCPOiIvK"; // Tu user ID real
        // Get current settings
        const { data: currentSettings } = await supabase
            .from('user_settings')
            .select('settings')
            .eq('user_id', userId)
            .single()

        if (!currentSettings) {
            return NextResponse.json({ error: 'No settings found' }, { status: 404 });
        }

        const settings = currentSettings.settings || {};

        // Fix preferred providers - convert to internal provider keys
        let preferredProviders = settings.preferredProviders || [];

        // Convert to internal provider keys
        preferredProviders = preferredProviders.map((p: string) => {
            if (p === 'Together' || p === 'Meta (Llama)') return 'meta';
            if (p === 'OpenAI') return 'openai';
            if (p === 'Anthropic') return 'anthropic';
            if (p === 'Google') return 'google';
            if (p === 'Mistral AI') return 'mistral';
            if (p === 'Grok') return 'grok';
            return p.toLowerCase(); // fallback
        });

        // Remove duplicates
        preferredProviders = Array.from(new Set(preferredProviders));

        const fixedSettings = {
            ...settings,
            preferredProviders
        };
        // Update the settings
        const { error } = await supabase
            .from('user_settings')
            .update({
                settings: fixedSettings,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating settings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings fixed!',
            originalProviders: settings.preferredProviders,
            fixedProviders: fixedSettings.preferredProviders,
            fixedSettings
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}