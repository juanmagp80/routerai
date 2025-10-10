import { supabase } from './supabase'

export interface PlanLimits {
    plan_name: string
    api_key_limit: number
    monthly_request_limit: number
    rate_limit_per_minute: number
    allowed_models: string[]
    price_eur: number
    stripe_price_id?: string
    features: string[]
    trial_days: number
}

export interface UserUsage {
    monthly_requests_used: number
    last_reset_date: string
    free_trial_expires_at?: string
    plan: string
}

export class PlanLimitsService {
    // Obtener límites de un plan específico
    static async getPlanLimits(planName: string): Promise<PlanLimits | null> {
        const { data, error } = await supabase
            .from('plan_limits')
            .select('*')
            .eq('plan_name', planName)
            .single()

        if (error) {
            console.error('Error fetching plan limits:', error)
            return null
        }

        return data
    }

    // Obtener todos los planes disponibles
    static async getAllPlans(): Promise<PlanLimits[]> {
        const { data, error } = await supabase
            .from('plan_limits')
            .select('*')
            .order('price_eur', { ascending: true })

        if (error) {
            console.error('Error fetching all plans:', error)
            return []
        }

        return data || []
    }

    // Verificar si el usuario puede crear más API keys
    static async canCreateApiKey(userId: string): Promise<{ allowed: boolean, reason?: string, current: number, limit: number }> {
        // Obtener usuario y límites
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('plan')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return { allowed: false, reason: 'Usuario no encontrado', current: 0, limit: 0 }
        }

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return { allowed: false, reason: 'Plan no válido', current: 0, limit: 0 }
        }

        // Contar API keys actuales
        const { data: apiKeys, error: apiError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true)

        if (apiError) {
            return { allowed: false, reason: 'Error verificando API keys', current: 0, limit: planLimits.api_key_limit }
        }

        const currentCount = apiKeys?.length || 0
        const allowed = currentCount < planLimits.api_key_limit

        return {
            allowed,
            reason: allowed ? undefined : `Límite de ${planLimits.api_key_limit} API keys alcanzado`,
            current: currentCount,
            limit: planLimits.api_key_limit
        }
    }

    // Verificar si el usuario puede hacer más requests este mes
    static async canMakeRequest(userId: string): Promise<{ allowed: boolean, reason?: string, current: number, limit: number, percentage: number }> {
        // Obtener usuario y uso actual
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return { allowed: false, reason: 'Usuario no encontrado', current: 0, limit: 0, percentage: 0 }
        }

        // Verificar si el usuario está activo
        if (!user.is_active) {
            return { allowed: false, reason: 'Cuenta desactivada', current: 0, limit: 0, percentage: 0 }
        }

        // Verificar si la prueba gratuita ha expirado
        if (user.plan === 'free' && user.free_trial_expires_at) {
            const expirationDate = new Date(user.free_trial_expires_at)
            if (expirationDate < new Date()) {
                return { allowed: false, reason: 'Prueba gratuita expirada', current: 0, limit: 0, percentage: 100 }
            }
        }

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return { allowed: false, reason: 'Plan no válido', current: 0, limit: 0, percentage: 0 }
        }

        // Verificar si necesitamos resetear el contador mensual
        const lastReset = new Date(user.last_reset_date)
        const now = new Date()
        const shouldReset = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()

        let currentUsage = user.monthly_requests_used || 0

        if (shouldReset) {
            // Resetear contador mensual
            await supabase
                .from('users')
                .update({
                    monthly_requests_used: 0,
                    last_reset_date: now.toISOString().split('T')[0]
                })
                .eq('id', userId)

            currentUsage = 0
        }

        const limit = planLimits.monthly_request_limit
        const percentage = (currentUsage / limit) * 100
        const allowed = currentUsage < limit

        return {
            allowed,
            reason: allowed ? undefined : `Límite mensual de ${limit} requests alcanzado`,
            current: currentUsage,
            limit,
            percentage
        }
    }

    // Incrementar contador de requests
    static async incrementRequestCount(userId: string): Promise<boolean> {
        try {
            // Primero obtener el valor actual
            const { data: currentUser, error: fetchError } = await supabase
                .from('users')
                .select('monthly_requests_used')
                .eq('id', userId)
                .single()

            if (fetchError) {
                console.error('Error fetching current usage:', fetchError)
                return false
            }

            const newCount = (currentUser.monthly_requests_used || 0) + 1

            // Actualizar con el nuevo valor
            const { error } = await supabase
                .from('users')
                .update({ monthly_requests_used: newCount })
                .eq('id', userId)

            if (error) {
                console.error('Error incrementing request count:', error)
                return false
            }

            return true
        } catch (err) {
            console.error('Error in incrementRequestCount:', err)
            return false
        }
    }

    // Verificar si un modelo está permitido para el plan del usuario
    static async isModelAllowed(userId: string, modelName: string): Promise<boolean> {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('plan')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return false
        }

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return false
        }

        return planLimits.allowed_models.includes(modelName)
    }

    // Obtener resumen completo de límites y uso para un usuario
    static async getUserLimitsAndUsage(userId: string) {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active, created_at')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return null
        }

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return null
        }

        const apiKeyCheck = await this.canCreateApiKey(userId)
        const requestCheck = await this.canMakeRequest(userId)

        // Calcular días restantes de prueba
        let trialDaysRemaining = null
        if (user.plan === 'free' && user.free_trial_expires_at) {
            const expirationDate = new Date(user.free_trial_expires_at)
            const now = new Date()
            const diffTime = expirationDate.getTime() - now.getTime()
            trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
        }

        return {
            user: {
                plan: user.plan,
                isActive: user.is_active,
                createdAt: user.created_at,
                trialDaysRemaining
            },
            limits: planLimits,
            usage: {
                apiKeys: apiKeyCheck,
                requests: requestCheck
            }
        }
    }
}