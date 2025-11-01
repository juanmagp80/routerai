import { ApiKeyService } from '@/lib/api-key-service'
import { CacheHelpers } from '@/lib/cache-service'
import { CostProtectionService } from '@/lib/cost-protection'
import { DemoLimitManager } from '@/lib/demo-limit-manager'
import { PlanLimitsService } from '@/lib/plan-limits-service'
import { NextRequest, NextResponse } from 'next/server'

export interface ApiValidationResult {
    success: boolean
    userId?: string
    error?: string
    statusCode?: number
    remainingRequests?: number
    planName?: string
    costProtection?: {
        dailyCost: number
        dailyLimit: number
        currentRate: number
        rateLimit: number
        isSpike: boolean
        spikeMultiplier: number
    }
}

export class ApiMiddleware {
    // Verificar límite diario personalizado del usuario
    static async checkDailyLimit(userId: string): Promise<{ allowed: boolean; reason?: string; current: number; limit?: number }> {
        try {
            const { supabase } = await import('@/lib/supabase');

            // Obtener configuraciones del usuario
            const { data: userSettings } = await supabase
                .from('user_settings')
                .select('settings')
                .eq('user_id', userId)
                .single();

            const dailyLimit = userSettings?.settings?.dailyLimit;

            // Si no hay límite diario configurado, permitir
            if (!dailyLimit || typeof dailyLimit !== 'number') {
                return { allowed: true, current: 0 };
            }

            // Contar requests del día actual
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data: todayUsage, error } = await supabase
                .from('usage_records')
                .select('id')
                .eq('user_id', userId)
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString());

            if (error) {
                console.error('Error checking daily usage:', error);
                return { allowed: true, current: 0 }; // En caso de error, permitir
            }

            const currentDailyUsage = todayUsage?.length || 0;

            // Verificar si se excede el límite
            if (currentDailyUsage >= dailyLimit) {
                return {
                    allowed: false,
                    reason: `Límite diario alcanzado: ${currentDailyUsage}/${dailyLimit} requests. El límite se reinicia mañana.`,
                    current: currentDailyUsage,
                    limit: dailyLimit
                };
            }

            return {
                allowed: true,
                current: currentDailyUsage,
                limit: dailyLimit
            };

        } catch (error) {
            console.error('Error in daily limit check:', error);
            return { allowed: true, current: 0 }; // En caso de error, permitir
        }
    }

    // Validar API key y límites antes de procesar request
    static async validateApiRequest(request: NextRequest, modelName?: string, messageContent?: string): Promise<ApiValidationResult> {
        try {
            // 🧪 DEMO MODE INFO (non-blocking, just for logging)
            if (DemoLimitManager.isDemoMode()) {
                console.log('🧪 Demo mode active - provider limits configured for cost protection');

                // Log cost optimization suggestions
                if (modelName && messageContent) {
                    const suggestions = DemoLimitManager.getCostOptimizationSuggestions(modelName, messageContent.length);
                    if (suggestions.length > 0) {
                        console.log('💡 Cost optimization suggestions:', suggestions);
                    }
                }
            }

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

            // Verificar que la API key existe y está activa (con cache)
            const keyData = await CacheHelpers.getCachedApiKeyValidation(
                apiKey,
                () => ApiKeyService.validateApiKey(apiKey)
            )
            if (!keyData) {
                return {
                    success: false,
                    error: 'API key inválida o inactiva',
                    statusCode: 401
                }
            }

            const userId = keyData.user_id

            // 🧪 DEMO MODE INFO (informative only)
            if (DemoLimitManager.isDemoMode()) {
                console.log(`🧪 Demo request from user ${userId} - provider limits protect against excessive costs`);
            }

            // VERIFICAR LÍMITE DIARIO PERSONALIZADO
            const dailyLimitCheck = await this.checkDailyLimit(userId);
            console.log(`🚦 Daily limit check for ${userId}:`, dailyLimitCheck);

            if (!dailyLimitCheck.allowed) {
                console.log(`❌ Daily limit exceeded for ${userId}: ${dailyLimitCheck.current}/${dailyLimitCheck.limit}`);

                // Crear notificación de límite diario alcanzado
                this.createDailyLimitNotification(userId, dailyLimitCheck.current, dailyLimitCheck.limit!);

                return {
                    success: false,
                    error: dailyLimitCheck.reason,
                    statusCode: 429,
                    remainingRequests: 0
                };
            }

            // NUEVA PROTECCIÓN DE COSTOS Y RATE LIMITING
            const costProtection = await CostProtectionService.protectRequest(userId)
            if (!costProtection.allowed) {
                return {
                    success: false,
                    error: costProtection.reason || 'Request bloqueado por protección de costos',
                    statusCode: 429, // Too Many Requests
                    remainingRequests: 0,
                    costProtection: costProtection.metrics
                }
            }

            // Verificar límites de requests mensuales (legacy)
            const requestCheck = await PlanLimitsService.canMakeRequest(userId)
            if (!requestCheck.allowed) {
                return {
                    success: false,
                    error: requestCheck.reason || 'Límite de requests excedido',
                    statusCode: 429, // Too Many Requests
                    remainingRequests: 0,
                    costProtection: costProtection.metrics
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

            // Verificar alertas de costo (fire and forget)
            const { CostAlertService } = await import('@/lib/cost-alerts');
            CostAlertService.checkAlertsMiddleware(userId).catch(error =>
                console.error('Error checking cost alerts:', error)
            );

            // Obtener información actualizada para la respuesta
            const updatedLimits = await PlanLimitsService.getUserLimitsAndUsage(userId)

            // Re-obtener protección después de incrementar contador
            const finalCostProtection = await CostProtectionService.protectRequest(userId)

            return {
                success: true,
                userId,
                remainingRequests: updatedLimits?.usage.requests ?
                    (updatedLimits.usage.requests.limit - updatedLimits.usage.requests.current) : 0,
                planName: updatedLimits?.user.plan,
                costProtection: finalCostProtection.metrics
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
        const headers: Record<string, string> = {
            'X-RateLimit-Remaining': (result.remainingRequests || 0).toString(),
            'X-RateLimit-Plan': result.planName || 'unknown',
            'X-API-Version': '1.0'
        }

        // Agregar headers de protección de costos
        if (result.costProtection) {
            headers['X-Cost-Daily-Used'] = result.costProtection.dailyCost.toFixed(4)
            headers['X-Cost-Daily-Limit'] = result.costProtection.dailyLimit.toFixed(2)
            headers['X-Rate-Current'] = result.costProtection.currentRate.toString()
            headers['X-Rate-Limit'] = result.costProtection.rateLimit.toString()

            if (result.costProtection.isSpike) {
                headers['X-Cost-Spike-Warning'] = `${result.costProtection.spikeMultiplier.toFixed(1)}x normal usage`
            }
        }

        return headers
    }

    // Verificar notificaciones de forma asíncrona (no blocking)
    private static checkNotificationsAsync(userId: string): void {
        // Ejecutar en background sin bloquear la respuesta
        setTimeout(async () => {
            try {
                const { NotificationService } = await import('@/services/NotificationService');
                const { currentUser } = await import('@clerk/nextjs/server');

                // Get user email
                const user = await currentUser();
                const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';

                console.log(`🔍 Checking notifications for user: ${userEmail} (${userId})`);

                // Check and create notifications based on actual usage
                await NotificationService.checkAndCreateUsageNotifications(userId, userEmail);

                console.log(`✅ Notification check completed for ${userEmail}`);

            } catch (error) {
                console.log('⚠️ Error checking notifications:', error);
            }
        }, 100); // Small delay to not block the main response
    }

    // Crear notificación de límite diario alcanzado (no blocking)
    private static createDailyLimitNotification(userId: string, current: number, limit: number): void {
        setTimeout(async () => {
            try {
                const { NotificationService } = await import('@/services/NotificationService');
                await NotificationService.createNotification({
                    userId,
                    type: 'limit_reached',
                    title: 'Límite Diario Alcanzado',
                    message: `Has alcanzado tu límite diario personalizado de ${limit} requests (${current}/${limit}). El límite se reiniciará mañana a las 00:00.`,
                    metadata: {
                        daily_limit: limit,
                        current_usage: current,
                        limit_type: 'daily_custom'
                    }
                });
            } catch (error) {
                console.log('⚠️ Error creating daily limit notification:', error);
            }
        }, 50);
    }

    // Middleware completo para rutas API
    static async handleApiRequest(
        request: NextRequest,
        handler: (userId: string, request: NextRequest) => Promise<NextResponse>,
        modelName?: string,
        messageContent?: string
    ): Promise<NextResponse> {

        // Validar request
        const validation = await this.validateApiRequest(request, modelName, messageContent)

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

            // Verificar notificaciones después de request exitoso (no blocking)
            this.checkNotificationsAsync(validation.userId!)

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