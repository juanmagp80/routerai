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
                defaultModel: 'auto', // Cambiado de gpt-4o-mini a auto para más variedad
                preferredProviders: [],
                emailNotifications: true,
                usageAlerts: true,
                usageAlertThreshold: 80,
                dailyLimit: undefined,
                costProtection: true,
                autoModelRotation: false,
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
            defaultModel: settings.defaultModel || 'auto',
            preferredProviders: Array.isArray(settings.preferredProviders) ? settings.preferredProviders : [],
            emailNotifications: Boolean(settings.emailNotifications),
            usageAlerts: Boolean(settings.usageAlerts),
            usageAlertThreshold: Math.min(95, Math.max(50, parseInt(settings.usageAlertThreshold) || 80)),
            dailyLimit: settings.dailyLimit ? Math.max(1, parseInt(settings.dailyLimit)) : undefined,
            costProtection: settings.costProtection !== undefined ? Boolean(settings.costProtection) : true,
            autoModelRotation: Boolean(settings.autoModelRotation),
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