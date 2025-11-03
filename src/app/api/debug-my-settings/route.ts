import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        let userId: string | null = null;

        try {
            const authResult = await auth();
            userId = authResult.userId;
        } catch (authError) {
        }
        // Show all user_settings for debugging
        const { data: allSettings, error: allError } = await supabase
            .from('user_settings')
            .select('*')

        let userSettings = null;
        let userError = null;

        if (userId) {
            const { data: settings, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single()

            userSettings = settings;
            userError = error;
        }

        return NextResponse.json({
            authWorking: !!userId,
            userId: userId,
            userSettings: userSettings,
            userError: userError,
            allSettingsInDB: allSettings,
            allError: allError,
            message: userId ? (userSettings ? 'User has settings' : 'No settings found for user') : 'Not authenticated'
        })

    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}