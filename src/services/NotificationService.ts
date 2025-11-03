import { supabase } from '@/lib/supabase';

export interface NotificationData {
  userId: string;
  type: 'limit_warning' | 'limit_reached' | 'trial_expiring' | 'upgrade_suggestion' | 'general';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead?: boolean;
}

export class NotificationService {
  /**
   * Creates a notification in the database
   */
  static async createNotification(data: NotificationData): Promise<boolean> {
    try {
      // Check if a similar notification already exists to avoid duplicates
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', data.userId)
        .eq('type', data.type)
        .eq('is_read', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .single();

      if (existing) {
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          is_read: data.isRead || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error in createNotification:', error);
      return false;
    }
  }

  /**
   * Checks user usage and creates appropriate notifications
   */
  static async checkAndCreateUsageNotifications(userId: string, userEmail: string): Promise<void> {
    try {
      // Get user plan and usage
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('clerk_user_id', userId)
        .single();

      if (!user) {
        return;
      }

      // Get plan limits
      const { data: planLimits } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_name', user.plan)
        .single();

      if (!planLimits) {
        return;
      }

      // Get current month usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usageRecords } = await supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      const totalRequests = usageRecords?.length || 0;
      const monthlyLimit = planLimits.monthly_request_limit;

      // Calculate usage percentage
      const usagePercentage = (totalRequests / monthlyLimit) * 100;
      // Obtener configuraciones de notificaciones del usuario
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single();

      const settings = userSettings?.settings || {};
      const usageAlerts = settings.usageAlerts !== false; // Default true
      const emailNotifications = settings.emailNotifications !== false; // Default true
      const customThreshold = settings.usageAlertThreshold || 80; // Default 80%

        usageAlerts,
        emailNotifications,
        customThreshold,
        currentUsage: usagePercentage.toFixed(1) + '%'
      });

      // Solo generar notificaciones si el usuario las tiene habilitadas
      if (!usageAlerts) {
        return;
      }

      // Generate notifications based on usage and user preferences
      if (usagePercentage >= 100) {
        // Limit reached - always notify regardless of threshold
        const created = await this.createNotification({
          userId,
          type: 'limit_reached',
          title: 'API Limit Reached',
          message: `You have reached your monthly API request limit of ${monthlyLimit.toLocaleString()} requests. Upgrade your plan or wait until next month to continue using the service.`,
          metadata: {
            current_usage: totalRequests,
            limit: monthlyLimit,
            percentage: usagePercentage,
            email_enabled: emailNotifications
          }
        });

        // Send email if enabled
        if (created && emailNotifications) {
          this.sendEmailNotification(userEmail, 'API Limit Reached',
            `Your monthly API limit of ${monthlyLimit.toLocaleString()} requests has been reached.`);
        }
      } else if (usagePercentage >= customThreshold) {
        // Custom threshold warning
        const created = await this.createNotification({
          userId,
          type: 'limit_warning',
          title: 'API Usage Alert',
          message: `You've used ${usagePercentage.toFixed(1)}% of your monthly API request limit (${totalRequests.toLocaleString()}/${monthlyLimit.toLocaleString()}). You configured alerts at ${customThreshold}% usage.`,
          metadata: {
            current_usage: totalRequests,
            limit: monthlyLimit,
            percentage: usagePercentage,
            threshold: customThreshold,
            email_enabled: emailNotifications
          }
        });

        // Send email if enabled
        if (created && emailNotifications) {
          this.sendEmailNotification(userEmail, 'API Usage Alert',
            `You've reached ${usagePercentage.toFixed(1)}% of your API usage limit (${totalRequests.toLocaleString()}/${monthlyLimit.toLocaleString()} requests).`);
        }
      }

      // Upgrade suggestion for free/starter users with significant usage (only if notifications enabled)
      if ((user.plan === 'free' || user.plan === 'starter') && usagePercentage >= 50 && usageAlerts) {
        const created = await this.createNotification({
          userId,
          type: 'upgrade_suggestion',
          title: 'Upgrade Recommended',
          message: `You're actively using our API! Consider upgrading to the Pro plan for higher limits, priority support, and advanced features.`,
          metadata: {
            current_plan: user.plan,
            current_usage: totalRequests,
            limit: monthlyLimit,
            percentage: usagePercentage,
            email_enabled: emailNotifications
          }
        });

        // Send email if enabled
        if (created && emailNotifications) {
          this.sendEmailNotification(userEmail, 'Upgrade Recommended',
            `You're using ${usagePercentage.toFixed(1)}% of your ${user.plan} plan. Upgrade to Pro for higher limits and better features.`);
        }
      }

    } catch (error) {
      console.error('❌ Error in checkAndCreateUsageNotifications:', error);
    }
  }

  /**
   * Deletes old notifications to keep the system clean
   */
  static async cleanupOldNotifications(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Error cleaning up old notifications:', error);
      } else {
      }
    } catch (error) {
      console.error('❌ Error in cleanupOldNotifications:', error);
    }
  }

  /**
   * Sends an email notification using Resend
   */
  private static sendEmailNotification(email: string, subject: string, message: string): void {
    // Send email in background to not block the main flow
    setTimeout(async () => {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: `[Roulyx] ${subject}`,
            message: message
          })
        });

        if (response.ok) {
        } else {
        }
      } catch (error) {
      }
    }, 100);
  }
}