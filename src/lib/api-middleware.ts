import { ApiKeyService } from '@/lib/api-key-service'
import { PlanLimitsService } from '@/lib/plan-limits-service'
import { NextRequest, NextResponse } from 'next/server'

export interface ApiValidationResult {
    success: boolean
    userId?: string
    error?: string
    statusCode?: number
    remainingRequests?: number
    planName?: string
}

export class ApiMiddleware {
    // Validar API key y límites antes de procesar request
    static async validateApiRequest(request: NextRequest, modelName?: string): Promise<ApiValidationResult> {
        try {
            // Extraer API key del header
            const authHeader = request.headers.get('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    success: false,
                    error: 'API key requerida. Use: Authorization: Bearer YOUR_API_KEY',
                    statusCode: 401
                }
            }

            const apiKey = authHeader.substring(7) // Remover 'Bearer '

            // Validar formato de API key
            if (!apiKey.startsWith('rtr_')) {
                return {
                    success: false,
                    error: 'Formato de API key inválido. Debe comenzar con "rtr_"',
                    statusCode: 401
                }
            }

            // Verificar que la API key existe y está activa
            const keyData = await ApiKeyService.validateApiKey(apiKey)
            if (!keyData) {
                return {
                    success: false,
                    error: 'API key inválida o inactiva',
                    statusCode: 401
                }
            }

            const userId = keyData.user_id

            // Verificar límites de requests mensuales
            const requestCheck = await PlanLimitsService.canMakeRequest(userId)
            if (!requestCheck.allowed) {
                return {
                    success: false,
                    error: requestCheck.reason || 'Límite de requests excedido',
                    statusCode: 429, // Too Many Requests
                    remainingRequests: 0
                }
            }

            // Verificar si el modelo está permitido para el plan del usuario
            if (modelName && modelName !== 'auto') {
                const modelAllowed = await PlanLimitsService.isModelAllowed(userId, modelName)
                if (!modelAllowed) {
                    const userLimits = await PlanLimitsService.getUserLimitsAndUsage(userId)
                    return {
                        success: false,
                        error: `El modelo "${modelName}" no está disponible en tu plan ${userLimits?.user.plan || 'actual'}. Actualiza tu plan para acceder a este modelo.`,
                        statusCode: 403
                    }
                }
            }

            // Actualizar último uso de la API key
            await ApiKeyService.updateLastUsed(keyData.id)

            // Incrementar contador de requests (modelo se registrará después con el modelo real)
            await PlanLimitsService.incrementRequestCount(userId, modelName)

            // Obtener información actualizada para la respuesta
            const updatedLimits = await PlanLimitsService.getUserLimitsAndUsage(userId)

            return {
                success: true,
                userId,
                remainingRequests: updatedLimits?.usage.requests ?
                    (updatedLimits.usage.requests.limit - updatedLimits.usage.requests.current) : 0,
                planName: updatedLimits?.user.plan
            }

        } catch (error) {
            console.error('Error in API validation:', error)
            return {
                success: false,
                error: 'Error interno del servidor',
                statusCode: 500
            }
        }
    }

    // Crear respuesta de error estandarizada
    static createErrorResponse(result: ApiValidationResult): NextResponse {
        const response = {
            error: {
                message: result.error,
                type: result.statusCode === 401 ? 'authentication_error' :
                    result.statusCode === 403 ? 'permission_error' :
                        result.statusCode === 429 ? 'rate_limit_error' : 'api_error',
                code: result.statusCode
            }
        }

        return NextResponse.json(response, { status: result.statusCode || 400 })
    }

    // Crear headers de respuesta con información de límites
    static createRateLimitHeaders(result: ApiValidationResult): Record<string, string> {
        return {
            'X-RateLimit-Remaining': (result.remainingRequests || 0).toString(),
            'X-RateLimit-Plan': result.planName || 'unknown',
            'X-API-Version': '1.0'
        }
    }

    // Middleware completo para rutas API
    static async handleApiRequest(
        request: NextRequest,
        handler: (userId: string, request: NextRequest) => Promise<NextResponse>,
        modelName?: string
    ): Promise<NextResponse> {

        // Validar request
        const validation = await this.validateApiRequest(request, modelName)

        if (!validation.success) {
            return this.createErrorResponse(validation)
        }

        try {
            // Ejecutar el handler real
            const response = await handler(validation.userId!, request)

            // Agregar headers de rate limiting
            const headers = this.createRateLimitHeaders(validation)
            Object.entries(headers).forEach(([key, value]) => {
                response.headers.set(key, value)
            })

            return response

        } catch (error) {
            console.error('Error in API handler:', error)
            return NextResponse.json(
                {
                    error: {
                        message: 'Error interno del servidor',
                        type: 'api_error',
                        code: 500
                    }
                },
                { status: 500 }
            )
        }
    }
}