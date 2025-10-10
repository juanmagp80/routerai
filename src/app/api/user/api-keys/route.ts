import { ApiKeyService } from '@/lib/api-key-service'
import { PlanLimitsService } from '@/lib/plan-limits-service'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener API keys del usuario
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const apiKeys = await ApiKeyService.getApiKeysByUserId(userId)
    return NextResponse.json(apiKeys)

  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva API key
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar límites del usuario
    const userLimits = await PlanLimitsService.getUserLimitsAndUsage(userId)
    if (!userLimits) {
      return NextResponse.json(
        { error: 'No se pudieron obtener los límites del usuario' },
        { status: 500 }
      )
    }

    if (userLimits.usage.apiKeys.current >= userLimits.usage.apiKeys.limit) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${userLimits.usage.apiKeys.limit} API keys para tu plan` },
        { status: 403 }
      )
    }

    // Crear la API key
    const apiKeyData = {
      user_id: userId,
      name: name.trim(),
      key_hash: `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      is_active: true
    }

    const newApiKey = await ApiKeyService.createApiKey(apiKeyData)
    
    if (!newApiKey) {
      return NextResponse.json(
        { error: 'Error al crear la API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'API key creada exitosamente',
      apiKey: newApiKey
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}