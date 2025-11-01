import { supabase } from './supabase';
import { COST_PROTECTION_CONFIG } from './cost-protection';

export interface CostAlert {
  id: string;
  userId: string;
  alertType: 'daily_80_percent' | 'monthly_50_percent' | 'unusual_spike' | 'global_limit' | 'plan_exceeded';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  metadata: {
    currentCost?: number;
    limit?: number;
    percentage?: number;
    spikeMultiplier?: number;
  };
  createdAt: string;
}

export class CostAlertService {
  // Verificar y enviar alertas de costo diario
  static async checkDailyCostAlerts(userId: string): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    try {
      // Obtener el plan del usuario
      const { data: user } = await supabase
        .from('users')
        .select('plan, email')
        .eq('clerk_user_id', userId)
        .single();

      if (!user) return alerts;

      const userPlan = user.plan as keyof typeof COST_PROTECTION_CONFIG.dailyCostLimits;
      const dailyLimit = COST_PROTECTION_CONFIG.dailyCostLimits[userPlan];

      // Calcular costo del día
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('usage_records')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const dailyCost = todayRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;

      const percentage = (dailyCost / dailyLimit) * 100;

      // Alerta al 80% del límite diario
      if (percentage >= 80 && percentage < 100) {
        const alert: CostAlert = {
          id: `daily_80_${userId}_${today}`,
          userId,
          alertType: 'daily_80_percent',
          message: `Has usado el ${percentage.toFixed(1)}% de tu límite diario de costo ($${dailyCost.toFixed(4)} de $${dailyLimit.toFixed(2)})`,
          severity: 'warning',
          metadata: {
            currentCost: dailyCost,
            limit: dailyLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      // Alerta crítica al 100% (límite alcanzado)
      if (percentage >= 100) {
        const alert: CostAlert = {
          id: `daily_limit_${userId}_${today}`,
          userId,
          alertType: 'plan_exceeded',
          message: `¡LÍMITE DIARIO ALCANZADO! Costo: $${dailyCost.toFixed(4)}. Límite: $${dailyLimit.toFixed(2)}. Requests bloqueados hasta mañana.`,
          severity: 'critical',
          metadata: {
            currentCost: dailyCost,
            limit: dailyLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking daily cost alerts:', error);
      return alerts;
    }
  }

  // Verificar alertas de costo mensual
  static async checkMonthlyCostAlerts(userId: string): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    try {
      // Obtener datos del usuario y límites del plan
      const { data: user } = await supabase
        .from('users')
        .select('plan, monthly_requests_used')
        .eq('clerk_user_id', userId)
        .single();

      if (!user) return alerts;

      const { data: planLimits } = await supabase
        .from('plan_limits')
        .select('monthly_request_limit')
        .eq('plan_name', user.plan)
        .single();

      if (!planLimits) return alerts;

      const monthlyUsage = user.monthly_requests_used || 0;
      const monthlyLimit = planLimits.monthly_request_limit;
      const percentage = (monthlyUsage / monthlyLimit) * 100;

      // Alerta al 50% del límite mensual
      if (percentage >= 50 && percentage < 80) {
        const alert: CostAlert = {
          id: `monthly_50_${userId}_${new Date().getMonth()}`,
          userId,
          alertType: 'monthly_50_percent',
          message: `Has usado el ${percentage.toFixed(1)}% de tus requests mensuales (${monthlyUsage} de ${monthlyLimit})`,
          severity: 'info',
          metadata: {
            currentCost: monthlyUsage,
            limit: monthlyLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      // Alerta crítica al 80%
      if (percentage >= 80) {
        const alert: CostAlert = {
          id: `monthly_80_${userId}_${new Date().getMonth()}`,
          userId,
          alertType: 'monthly_50_percent',
          message: `¡ATENCIÓN! Has usado el ${percentage.toFixed(1)}% de tus requests mensuales (${monthlyUsage} de ${monthlyLimit})`,
          severity: 'critical',
          metadata: {
            currentCost: monthlyUsage,
            limit: monthlyLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking monthly cost alerts:', error);
      return alerts;
    }
  }

  // Detectar y alertar sobre picos inusuales
  static async checkUnusualSpikeAlerts(userId: string): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    try {
      // Usar el servicio de protección existente
      const { CostProtectionService } = await import('./cost-protection');
      const spikeCheck = await CostProtectionService.detectUnusualSpike(userId);

      if (spikeCheck.isSpike) {
        const alert: CostAlert = {
          id: `spike_${userId}_${Date.now()}`,
          userId,
          alertType: 'unusual_spike',
          message: `Pico inusual de uso detectado: ${spikeCheck.multiplier.toFixed(1)}x el costo normal. Costo hoy: $${spikeCheck.currentCost.toFixed(4)} vs promedio: $${spikeCheck.averageCost.toFixed(4)}`,
          severity: 'warning',
          metadata: {
            currentCost: spikeCheck.currentCost,
            spikeMultiplier: spikeCheck.multiplier
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking spike alerts:', error);
      return alerts;
    }
  }

  // Alertas globales del sistema
  static async checkGlobalAlerts(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    try {
      // Calcular costo global del día
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('usage_records')
        .select('cost')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const globalCostToday = todayRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;

      const globalLimit = COST_PROTECTION_CONFIG.emergencyShutoff.dailyGlobalLimit;
      const percentage = (globalCostToday / globalLimit) * 100;

      // Alerta global al 70%
      if (percentage >= 70 && percentage < 90) {
        const alert: CostAlert = {
          id: `global_70_${today}`,
          userId: 'SYSTEM',
          alertType: 'global_limit',
          message: `Costo global del sistema al ${percentage.toFixed(1)}%: $${globalCostToday.toFixed(2)} de $${globalLimit.toFixed(2)}`,
          severity: 'warning',
          metadata: {
            currentCost: globalCostToday,
            limit: globalLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      // Alerta crítica global al 90%
      if (percentage >= 90) {
        const alert: CostAlert = {
          id: `global_90_${today}`,
          userId: 'SYSTEM',
          alertType: 'global_limit',
          message: `¡ALERTA CRÍTICA! Costo global del sistema al ${percentage.toFixed(1)}%: $${globalCostToday.toFixed(2)} de $${globalLimit.toFixed(2)}. Considerar activar modo de emergencia.`,
          severity: 'critical',
          metadata: {
            currentCost: globalCostToday,
            limit: globalLimit,
            percentage
          },
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking global alerts:', error);
      return alerts;
    }
  }

  // Procesar todas las alertas para un usuario
  static async processUserAlerts(userId: string): Promise<CostAlert[]> {
    const allAlerts: CostAlert[] = [];

    try {
      // Ejecutar todas las verificaciones en paralelo
      const [dailyAlerts, monthlyAlerts, spikeAlerts] = await Promise.all([
        this.checkDailyCostAlerts(userId),
        this.checkMonthlyCostAlerts(userId),
        this.checkUnusualSpikeAlerts(userId)
      ]);

      allAlerts.push(...dailyAlerts, ...monthlyAlerts, ...spikeAlerts);

      // Filtrar alertas duplicadas por ID
      const uniqueAlerts = allAlerts.filter((alert, index, arr) => 
        arr.findIndex(a => a.id === alert.id) === index
      );

      // Guardar alertas en la base de datos para tracking
      if (uniqueAlerts.length > 0) {
        await this.saveAlertsToDatabase(uniqueAlerts);
      }

      return uniqueAlerts;
    } catch (error) {
      console.error('Error processing user alerts:', error);
      return allAlerts;
    }
  }

  // Guardar alertas en la base de datos
  private static async saveAlertsToDatabase(alerts: CostAlert[]): Promise<void> {
    try {
      // Crear una tabla de alertas si no existe
      const alertRecords = alerts.map(alert => ({
        id: alert.id,
        user_id: alert.userId,
        alert_type: alert.alertType,
        message: alert.message,
        severity: alert.severity,
        metadata: alert.metadata,
        created_at: alert.createdAt
      }));

      // Intentar insertar, ignorar duplicados
      await supabase
        .from('cost_alerts')
        .upsert(alertRecords, { onConflict: 'id' });

    } catch (error) {
      console.error('Error saving alerts to database:', error);
      // No fallar si no se pueden guardar las alertas
    }
  }

  // Enviar notificaciones por email/webhook (implementar según necesidades)
  static async sendAlertNotifications(alerts: CostAlert[]): Promise<void> {
    for (const alert of alerts) {
      try {
        // Aquí se pueden implementar diferentes canales de notificación:
        // - Email
        // - Slack webhook
        // - Discord webhook
        // - SMS
        
        console.log(`🚨 ALERTA ${alert.severity.toUpperCase()}: ${alert.message}`);
        
        // TODO: Implementar envío real de notificaciones
        // await sendEmailAlert(alert);
        // await sendSlackAlert(alert);
        
      } catch (error) {
        console.error('Error sending alert notification:', error);
      }
    }
  }

  // Middleware para verificar alertas en cada request
  static async checkAlertsMiddleware(userId: string): Promise<void> {
    try {
      // Ejecutar verificación de alertas en background (fire and forget)
      this.processUserAlerts(userId)
        .then(alerts => {
          if (alerts.length > 0) {
            this.sendAlertNotifications(alerts);
          }
        })
        .catch(error => console.error('Error in alerts middleware:', error));
    } catch (error) {
      console.error('Error in alerts middleware:', error);
    }
  }
}