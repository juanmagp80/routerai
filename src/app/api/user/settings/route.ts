import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error)
            return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
        }

        // Devolver configuración por defecto si no existe
        if (!settings) {
            const defaultSettings = {
                defaultModel: 'gpt-4o-mini',
                preferredProviders: [],
                emailNotifications: true,
                usageAlerts: true,
                weeklyReports: false,
                theme: 'light',
                language: 'es',
                compactView: false,
                usageAlertThreshold: 80,
            }
            return NextResponse.json(defaultSettings)
        }

        return NextResponse.json(settings.settings || {})
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('💾 Saving settings for user:', userId);
        const settings = await request.json()
        console.log('💾 Raw settings received:', settings);

        // Validar que los datos sean correctos
        const validatedSettings = {
            defaultModel: settings.defaultModel || 'gpt-4o-mini',
            preferredProviders: Array.isArray(settings.preferredProviders) ? settings.preferredProviders : [],
            emailNotifications: Boolean(settings.emailNotifications),
            usageAlerts: Boolean(settings.usageAlerts),
            weeklyReports: Boolean(settings.weeklyReports),
            theme: ['light', 'dark', 'auto'].includes(settings.theme) ? settings.theme : 'light',
            language: ['es', 'en', 'fr'].includes(settings.language) ? settings.language : 'es',
            compactView: Boolean(settings.compactView),
            usageAlertThreshold: Math.min(95, Math.max(50, parseInt(settings.usageAlertThreshold) || 80)),
        }

        console.log('💾 Validated settings:', validatedSettings);

        // Usar upsert para crear o actualizar
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                settings: validatedSettings,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()

        if (error) {
            console.error('Error saving settings:', error)
            return NextResponse.json({ error: 'Error saving settings' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            settings: validatedSettings
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}