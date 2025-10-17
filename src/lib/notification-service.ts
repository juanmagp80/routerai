import { PlanLimitsService } from './plan-limits-service'
import { supabase } from './supabase'

export interface NotificationData {
    userId: string
    type: 'limit_warning' | 'limit_reached' | 'trial_expiring' | 'trial_expired' | 'upgrade_suggestion' | 'api_error' | 'welcome' | 'milestone'
    title: string
    message: string
    metadata?: Record<string, unknown>
}

export class NotificationService {
    // Crear tabla de notificaciones si no existe (ejecutar en SQL)
    static async createNotificationsTable() {
        return `
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
    `;
    }

    // ========== NOTIFICACIONES AUTOMÁTICAS INTELIGENTES ==========

    // Verificar y notificar sobre límites de uso
    static async checkAndNotifyUsageLimits(userId: string, customThreshold?: number): Promise<boolean> {
        try {
            // Obtener configuración del usuario
            const { data: settingsData } = await supabase
                .from('user_settings')
                .select('settings')
                .eq('user_id', userId)
                .single();

            const userSettings = settingsData?.settings || {};
            const usageAlertsEnabled = userSettings.usageAlerts !== false; // Default true
            const alertThreshold = customThreshold || userSettings.usageAlertThreshold || 80;

            // Si las alertas están deshabilitadas, no notificar
            if (!usageAlertsEnabled) {
                return false;
            }

            // Obtener datos de uso del usuario
            const result = await PlanLimitsService.getUserLimitsAndUsage(userId);
            if (!result) return false;

            const { limits, usage } = result;
            const usagePercentage = usage.requests.percentage;
            const requestsUsed = usage.requests.current;
            const requestsLimit = usage.requests.limit;

            // Notificar basado en el umbral configurado por el usuario
            if (usagePercentage >= alertThreshold && usagePercentage < 100) {
                // Umbral personalizado - Advertencia
                const alertLevel = usagePercentage >= 90 ? 'Critical' : 'High';
                const alertIcon = usagePercentage >= 90 ? '🚨' : '⚠️';

                await this.sendNotification({
                    userId,
                    type: 'limit_warning',
                    title: `${alertIcon} ${alertLevel} Usage Alert`,
                    message: `You've used ${usagePercentage.toFixed(1)}% of your monthly API quota. Only ${requestsLimit - requestsUsed} requests remaining.`,
                    metadata: {
                        usage_percentage: usagePercentage,
                        remaining: requestsLimit - requestsUsed,
                        alert_threshold: alertThreshold
                    }
                });
                return true;
            } else if (usagePercentage >= 100) {
                // 100% - Límite alcanzado
                await this.sendNotification({
                    userId,
                    type: 'limit_reached',
                    title: '🛑 API Limit Reached',
                    message: 'You have reached your monthly API quota. Upgrade your plan to continue using Roulix.',
                    metadata: { usage_percentage: usagePercentage, plan: limits.plan_name }
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking usage limits:', error);
            return false;
        }
    }

    // Sugerir upgrade basado en patrones de uso
    static async checkAndSuggestUpgrade(userId: string): Promise<boolean> {
        try {
            const result = await PlanLimitsService.getUserLimitsAndUsage(userId);
            if (!result) return false;

            const { usage, user } = result;
            const usagePercentage = usage.requests.percentage;

            // Sugerir upgrade si está usando mucho del plan actual
            if (usagePercentage >= 75 && user.plan !== 'ENTERPRISE') {
                const nextPlan = this.getNextPlanRecommendation(user.plan);

                await this.sendNotification({
                    userId,
                    type: 'upgrade_suggestion',
                    title: '📈 Upgrade Recommendation',
                    message: `Based on your usage (${usagePercentage.toFixed(1)}%), upgrading to ${nextPlan} could provide better value and avoid limits.`,
                    metadata: {
                        current_plan: user.plan,
                        suggested_plan: nextPlan,
                        usage_percentage: usagePercentage
                    }
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking upgrade suggestions:', error);
            return false;
        }
    }

    // Notificar errores frecuentes de API
    static async notifyApiErrors(userId: string, errorCount: number, errorType: string): Promise<boolean> {
        try {
            if (errorCount >= 5) { // Si hay 5 o más errores
                await this.sendNotification({
                    userId,
                    type: 'api_error',
                    title: '⚠️ API Errors Detected',
                    message: `We've detected ${errorCount} ${errorType} errors in your recent API calls. Check your integration or contact support.`,
                    metadata: { error_count: errorCount, error_type: errorType }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error notifying API errors:', error);
            return false;
        }
    }

    // Notificar cuando el usuario crea su primera API key
    static async notifyFirstApiKey(userId: string): Promise<boolean> {
        try {
            await this.sendNotification({
                userId,
                type: 'welcome',
                title: '🎉 Welcome to Roulix!',
                message: 'Your API key has been created successfully. Check out our documentation to get started with your first AI request.',
                metadata: { milestone: 'first_api_key' }
            });
            return true;
        } catch (error) {
            console.error('Error sending welcome notification:', error);
            return false;
        }
    }

    // Notificar hitos de uso
    static async notifyUsageMilestone(userId: string, milestone: number): Promise<boolean> {
        try {
            const milestoneMessages = {
                100: '🎯 First 100 API calls completed! You\'re getting the hang of Roulix.',
                1000: '🚀 1,000 API calls milestone reached! You\'re building something amazing.',
                10000: '⭐ 10,000 API calls! You\'re a Roulix power user.',
                100000: '🏆 100,000 API calls! Consider our Enterprise plan for even better rates.'
            };

            const message = milestoneMessages[milestone as keyof typeof milestoneMessages];
            if (message) {
                await this.sendNotification({
                    userId,
                    type: 'milestone',
                    title: `Milestone: ${milestone.toLocaleString()} API Calls`,
                    message,
                    metadata: { milestone: milestone }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending milestone notification:', error);
            return false;
        }
    }

    // Helper: Obtener recomendación de siguiente plan
    private static getNextPlanRecommendation(currentPlan: string): string {
        const planHierarchy = {
            'free': 'starter',
            'starter': 'pro',
            'pro': 'enterprise',
            'enterprise': 'enterprise'
        };
        return planHierarchy[currentPlan.toLowerCase() as keyof typeof planHierarchy] || 'pro';
    }

    // Enviar notificación
    static async sendNotification(notification: NotificationData): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: notification.userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    metadata: notification.metadata || {}
                })

            if (error) {
                console.error('Error sending notification:', error)
                return false
            }

            // Log para seguimiento
            console.log(`📧 Notification sent to user ${notification.userId}: ${notification.title}`)
            return true
        } catch (err) {
            console.error('Error in sendNotification:', err)
            return false
        }
    }

    // Obtener notificaciones de un usuario
    static async getUserNotifications(userId: string, limit: number = 20, onlyUnread: boolean = false) {
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (onlyUnread) {
                query = query.eq('read', false)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching notifications:', error)
                return []
            }

            return data || []
        } catch (err) {
            console.error('Error in getUserNotifications:', err)
            return []
        }
    }

    // Marcar notificación como leída
    static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', userId)

            if (error) {
                console.error('Error marking notification as read:', error)
                return false
            }

            return true
        } catch (err) {
            console.error('Error in markAsRead:', err)
            return false
        }
    }

    // Marcar todas las notificaciones como leídas
    static async markAllAsRead(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false)

            if (error) {
                console.error('Error marking all notifications as read:', error)
                return false
            }

            return true
        } catch (err) {
            console.error('Error in markAllAsRead:', err)
            return false
        }
    }

    // Verificar y enviar alertas automáticas
    static async checkAndSendAlerts(userId: string): Promise<void> {
        try {
            const limitsData = await PlanLimitsService.getUserLimitsAndUsage(userId)
            if (!limitsData) return

            const { user, usage } = limitsData

            // Alerta de límite de requests al 80%
            if (usage.requests.percentage >= 80 && usage.requests.percentage < 100) {
                await this.sendNotification({
                    userId,
                    type: 'limit_warning',
                    title: '⚠️ Approaching request limit',
                    message: `You have used ${usage.requests.current} of ${usage.requests.limit} requests this month (${usage.requests.percentage.toFixed(1)}%). Consider upgrading to a paid plan to get more requests.`,
                    metadata: {
                        current: usage.requests.current,
                        limit: usage.requests.limit,
                        percentage: usage.requests.percentage,
                        plan: user.plan
                    }
                })
            }

            // Alerta de límite alcanzado
            if (usage.requests.percentage >= 100) {
                await this.sendNotification({
                    userId,
                    type: 'limit_reached',
                    title: '🚫 Límite de requests alcanzado',
                    message: `Has alcanzado tu límite de ${usage.requests.limit} requests este mes. Actualiza tu plan para continuar usando Roulix.`,
                    metadata: {
                        current: usage.requests.current,
                        limit: usage.requests.limit,
                        plan: user.plan
                    }
                })
            }

            // Nota: Los usuarios FREE no tienen límite de tiempo, solo límite de requests
            // Por lo tanto, no enviamos notificaciones de trial expiration

            // Sugerencia de upgrade basada en uso
            if (user.plan === 'free' && usage.requests.percentage >= 60) {
                await this.sendNotification({
                    userId,
                    type: 'upgrade_suggestion',
                    title: '🚀 ¿Listo para más poder?',
                    message: `Has usado ${usage.requests.percentage.toFixed(1)}% de tus requests gratuitos. Con el plan Starter obtienes 10,000 requests por solo €29/mes.`,
                    metadata: {
                        currentPlan: user.plan,
                        recommendedPlan: 'starter',
                        currentUsage: usage.requests.percentage
                    }
                })
            }

        } catch (err) {
            console.error('Error in checkAndSendAlerts:', err)
        }
    }

    // Ejecutar verificación de alertas para todos los usuarios (cron job)
    static async runGlobalAlertCheck(): Promise<void> {
        try {
            console.log('🔄 Running global alert check...')

            // Obtener usuarios activos
            const { data: users, error } = await supabase
                .from('users')
                .select('id')
                .eq('is_active', true)

            if (error) {
                console.error('Error fetching users for alert check:', error)
                return
            }

            if (!users) return

            console.log(`📊 Checking alerts for ${users.length} active users`)

            // Verificar alertas para cada usuario
            for (const user of users) {
                await this.checkAndSendAlerts(user.id)
                // Pequeña pausa para no sobrecargar la base de datos
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            console.log('✅ Global alert check completed')
        } catch (err) {
            console.error('Error in runGlobalAlertCheck:', err)
        }
    }

    // Limpiar notificaciones antiguas (más de 30 días)
    static async cleanupOldNotifications(): Promise<void> {
        try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { error } = await supabase
                .from('notifications')
                .delete()
                .lt('created_at', thirtyDaysAgo.toISOString())

            if (error) {
                console.error('Error cleaning up old notifications:', error)
                return
            }

            console.log('🧹 Old notifications cleaned up successfully')
        } catch (err) {
            console.error('Error in cleanupOldNotifications:', err)
        }
    }
}