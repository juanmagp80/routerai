import { PlanLimitsService } from './plan-limits-service'
import { supabase } from './supabase'

export interface NotificationData {
    userId: string
    type: 'limit_warning' | 'limit_reached' | 'trial_expiring' | 'trial_expired' | 'upgrade_suggestion'
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
                    title: '⚠️ Te estás acercando al límite',
                    message: `Has usado ${usage.requests.current} de ${usage.requests.limit} requests este mes (${usage.requests.percentage.toFixed(1)}%). Considera actualizar tu plan para evitar interrupciones.`,
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
                    message: `Has alcanzado tu límite de ${usage.requests.limit} requests este mes. Actualiza tu plan para continuar usando RouterAI.`,
                    metadata: {
                        current: usage.requests.current,
                        limit: usage.requests.limit,
                        plan: user.plan
                    }
                })
            }

            // Alertas de prueba gratuita (solo para plan FREE)
            if (user.plan === 'free' && user.trialDaysRemaining !== null) {
                if (user.trialDaysRemaining <= 2 && user.trialDaysRemaining > 0) {
                    await this.sendNotification({
                        userId,
                        type: 'trial_expiring',
                        title: '⏰ Tu prueba gratuita está por expirar',
                        message: `Te quedan ${user.trialDaysRemaining} días de prueba gratuita. Actualiza a un plan de pago para continuar usando RouterAI sin interrupciones.`,
                        metadata: {
                            daysRemaining: user.trialDaysRemaining,
                            recommendedPlan: 'starter'
                        }
                    })
                } else if (user.trialDaysRemaining <= 0) {
                    await this.sendNotification({
                        userId,
                        type: 'trial_expired',
                        title: '🔒 Tu prueba gratuita ha expirado',
                        message: 'Tu prueba gratuita ha terminado. Actualiza a un plan de pago para continuar accediendo a RouterAI.',
                        metadata: {
                            recommendedPlan: 'starter'
                        }
                    })
                }
            }

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