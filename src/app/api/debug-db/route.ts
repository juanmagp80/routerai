import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Obtener información de la estructura de las tablas
        const { data: usersTable, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(1)

        const { data: usageRecordsTable, error: usageError } = await supabase
            .from('usage_records')
            .select('*')
            .limit(1)

        // Intentar crear un registro de prueba para ver el error
        const testUserId = 'user_33t2Znh2CEyo72pUNBXLCPOiIvK'
        const { data: insertResult, error: insertError } = await supabase
            .from('usage_records')
            .insert({
                user_id: testUserId,
                requests_count: 1,
                model_used: 'test-model',
                created_at: new Date().toISOString()
            })
            .select()

        return NextResponse.json({
            tables: {
                users: {
                    data: usersTable,
                    error: usersError?.message
                },
                usageRecords: {
                    data: usageRecordsTable,
                    error: usageError?.message
                }
            },
            testInsert: {
                data: insertResult,
                error: insertError?.message
            }
        })

    } catch (error) {
        console.error('Database debug error:', error)
        return NextResponse.json(
            { error: 'Database debug failed', details: error },
            { status: 500 }
        )
    }
}