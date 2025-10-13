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
        // Primero intentar buscar por clerk_user_id
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, plan')
            .eq('clerk_user_id', userId)
            .single()

        // Si no se encuentra por clerk_user_id, intentar buscar directamente por id
        if (userError || !user) {
            const { data: directUser, error: directError } = await supabase
                .from('users')
                .select('id, plan')
                .eq('id', userId)
                .single()
            
            user = directUser
            userError = directError
        }

        if (userError || !user) {
            return { allowed: false, reason: 'Usuario no encontrado', current: 0, limit: 0 }
        }

        // Usar el ID real del usuario para las consultas posteriores
        const realUserId = user.id

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return { allowed: false, reason: 'Plan no válido', current: 0, limit: 0 }
        }

        // Contar API keys actuales
        const { data: apiKeys, error: apiError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', realUserId)
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
        // Primero intentar buscar por clerk_user_id
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active')
            .eq('clerk_user_id', userId)
            .single()

        // Si no se encuentra por clerk_user_id, intentar buscar directamente por id
        if (userError || !user) {
            const { data: directUser, error: directError } = await supabase
                .from('users')
                .select('id, plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active')
                .eq('id', userId)
                .single()
            
            user = directUser
            userError = directError
        }

        if (userError || !user) {
            return { allowed: false, reason: 'Usuario no encontrado', current: 0, limit: 0, percentage: 0 }
        }

        // Usar el ID real del usuario para las consultas posteriores
        const realUserId = user.id

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
                .eq('id', realUserId)

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
            // Primero intentar buscar por clerk_user_id para obtener el ID real
            let { data: currentUser, error: fetchError } = await supabase
                .from('users')
                .select('id, monthly_requests_used')
                .eq('clerk_user_id', userId)
                .single()

            // Si no se encuentra por clerk_user_id, intentar buscar directamente por id
            if (fetchError || !currentUser) {
                const { data: directUser, error: directError } = await supabase
                    .from('users')
                    .select('id, monthly_requests_used')
                    .eq('id', userId)
                    .single()
                
                currentUser = directUser
                fetchError = directError
            }

            if (fetchError || !currentUser) {
                console.error('Error fetching current usage:', fetchError)
                return false
            }

            const realUserId = currentUser.id

            const newCount = (currentUser.monthly_requests_used || 0) + 1

            // Actualizar con el nuevo valor
            const { error } = await supabase
                .from('users')
                .update({ monthly_requests_used: newCount })
                .eq('id', realUserId)

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
        // Primero intentar buscar por clerk_user_id
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('plan')
            .eq('clerk_user_id', userId)
            .single()

        // Si no se encuentra por clerk_user_id, intentar buscar directamente por id
        if (userError || !user) {
            const { data: directUser, error: directError } = await supabase
                .from('users')
                .select('plan')
                .eq('id', userId)
                .single()
            
            user = directUser
            userError = directError
        }

        if (userError || !user) {
            return false
        }

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return false
        }

        return planLimits.allowed_models.includes(modelName)
    }

    // Funciones internas que trabajan directamente con IDs reales (no Clerk IDs)
    private static async canCreateApiKeyInternal(realUserId: string, userPlan: string): Promise<{ allowed: boolean, reason?: string, current: number, limit: number }> {
        const planLimits = await this.getPlanLimits(userPlan)
        if (!planLimits) {
            return { allowed: false, reason: 'Plan no válido', current: 0, limit: 0 }
        }

        // Contar API keys actuales usando el ID real directamente
        const { data: apiKeys, error: apiError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', realUserId)
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

    private static async canMakeRequestInternal(realUserId: string, user: any): Promise<{ allowed: boolean, reason?: string, current: number, limit: number, percentage: number }> {
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
            // Resetear contador mensual usando ID real directamente
            await supabase
                .from('users')
                .update({
                    monthly_requests_used: 0,
                    last_reset_date: now.toISOString().split('T')[0]
                })
                .eq('id', realUserId)

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

    // Obtener resumen completo de límites y uso para un usuario
    static async getUserLimitsAndUsage(userId: string) {
        // Primero intentar buscar por clerk_user_id
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active, created_at')
            .eq('clerk_user_id', userId)
            .single()

        // Si no se encuentra por clerk_user_id, intentar buscar directamente por id
        if (userError || !user) {
            const { data: directUser, error: directError } = await supabase
                .from('users')
                .select('id, plan, monthly_requests_used, last_reset_date, free_trial_expires_at, is_active, created_at')
                .eq('id', userId)
                .single()
            
            user = directUser
            userError = directError
        }

        if (userError || !user) {
            return null
        }

        // Usar el ID real del usuario para las consultas posteriores
        const realUserId = user.id

        const planLimits = await this.getPlanLimits(user.plan)
        if (!planLimits) {
            return null
        }

        const apiKeyCheck = await this.canCreateApiKeyInternal(realUserId, user.plan)
        const requestCheck = await this.canMakeRequestInternal(realUserId, user)

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