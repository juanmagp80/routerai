import { supabase } from './supabase';

export interface CostProtectionConfig {
  dailyCostLimits: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
  rateLimits: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
  emergencyShutoff: {
    dailyGlobalLimit: number;
    unusualSpikeThreshold: number;
  };
}

export const COST_PROTECTION_CONFIG: CostProtectionConfig = {
  // Límites diarios por usuario (protección contra usuarios abusivos)
  dailyCostLimits: {
    free: 0.02,     // $0.02/día máximo
    starter: 2.00,   // $2.00/día máximo  
    pro: 8.00,       // $8.00/día máximo
    enterprise: 32.00 // $32.00/día máximo
  },

  // Rate limiting por minuto
  rateLimits: {
    free: 2,        // 2 req/min
    starter: 10,    // 10 req/min
    pro: 25,        // 25 req/min
    enterprise: 50  // 50 req/min
  },

  // Protección de emergencia global
  emergencyShutoff: {
    dailyGlobalLimit: 500.00,  // $500/día límite global
    unusualSpikeThreshold: 5.0  // Alerta si costo > 5x promedio
  }
};

export class CostProtectionService {
  // Verificar si el usuario puede hacer una request
  static async canMakeRequest(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    dailyCost: number;
    dailyLimit: number;
  }> {
    try {
      // Obtener el plan del usuario
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('clerk_user_id', userId)
        .single();

      if (!user) {
        return { allowed: false, reason: 'Usuario no encontrado', dailyCost: 0, dailyLimit: 0 };
      }

      const userPlan = user.plan as keyof typeof COST_PROTECTION_CONFIG.dailyCostLimits;
      const dailyLimit = COST_PROTECTION_CONFIG.dailyCostLimits[userPlan];

      // Calcular costo del usuario hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('usage_records')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const dailyCost = todayRecords?.reduce((sum, record) =>
        sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;

      // Verificar límite diario del usuario
      if (dailyCost >= dailyLimit) {
        return {
          allowed: false,
          reason: `Límite diario de costo alcanzado: $${dailyLimit.toFixed(2)}`,
          dailyCost,
          dailyLimit
        };
      }

      // Verificar límite global de emergencia
      const globalCostToday = await this.getGlobalDailyCost();
      if (globalCostToday >= COST_PROTECTION_CONFIG.emergencyShutoff.dailyGlobalLimit) {
        return {
          allowed: false,
          reason: 'Sistema en mantenimiento por alta demanda',
          dailyCost,
          dailyLimit
        };
      }

      return { allowed: true, dailyCost, dailyLimit };
    } catch (error) {
      console.error('Error in cost protection:', error);
      return { allowed: false, reason: 'Error de sistema', dailyCost: 0, dailyLimit: 0 };
    }
  }

  // Obtener costo global del día
  static async getGlobalDailyCost(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRecords } = await supabase
      .from('usage_records')
      .select('cost')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    return todayRecords?.reduce((sum, record) =>
      sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;
  }

  // Rate limiting por usuario
  static async checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    currentRate: number;
    limit: number;
  }> {
    try {
      // Obtener el plan del usuario
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('clerk_user_id', userId)
        .single();

      if (!user) {
        return { allowed: false, reason: 'Usuario no encontrado', currentRate: 0, limit: 0 };
      }

      const userPlan = user.plan as keyof typeof COST_PROTECTION_CONFIG.rateLimits;
      const rateLimit = COST_PROTECTION_CONFIG.rateLimits[userPlan];

      // Contar requests del último minuto
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { data: recentRecords, count } = await supabase
        .from('usage_records')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', oneMinuteAgo);

      const currentRate = count || 0;

      if (currentRate >= rateLimit) {
        return {
          allowed: false,
          reason: `Rate limit excedido: ${currentRate}/${rateLimit} requests/min`,
          currentRate,
          limit: rateLimit
        };
      }

      return { allowed: true, currentRate, limit: rateLimit };
    } catch (error) {
      console.error('Error in rate limiting:', error);
      return { allowed: false, reason: 'Error de sistema', currentRate: 0, limit: 0 };
    }
  }

  // Detectar picos inusuales
  static async detectUnusualSpike(userId: string): Promise<{
    isSpike: boolean;
    currentCost: number;
    averageCost: number;
    multiplier: number;
  }> {
    try {
      // Costo de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('usage_records')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const currentCost = todayRecords?.reduce((sum, record) =>
        sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;

      // Promedio de los últimos 7 días
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weekRecords } = await supabase
        .from('usage_records')
        .select('cost, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo)
        .lt('created_at', `${today}T00:00:00.000Z`);

      // Agrupar por día y calcular promedio
      const dailyCosts: { [key: string]: number } = {};
      weekRecords?.forEach(record => {
        const day = record.created_at.split('T')[0];
        dailyCosts[day] = (dailyCosts[day] || 0) + (parseFloat(record.cost?.toString() || '0') || 0);
      });

      const days = Object.keys(dailyCosts);
      const averageCost = days.length > 0
        ? Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0) / days.length
        : 0;

      const multiplier = averageCost > 0 ? currentCost / averageCost : 1;
      const isSpike = multiplier > COST_PROTECTION_CONFIG.emergencyShutoff.unusualSpikeThreshold;

      return { isSpike, currentCost, averageCost, multiplier };
    } catch (error) {
      console.error('Error detecting spike:', error);
      return { isSpike: false, currentCost: 0, averageCost: 0, multiplier: 1 };
    }
  }

  // Middleware completo de protección
  static async protectRequest(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    metrics: {
      dailyCost: number;
      dailyLimit: number;
      currentRate: number;
      rateLimit: number;
      isSpike: boolean;
      spikeMultiplier: number;
    };
  }> {
    // Verificar costo diario
    const costCheck = await this.canMakeRequest(userId);
    if (!costCheck.allowed) {
      return {
        allowed: false,
        reason: costCheck.reason,
        metrics: {
          dailyCost: costCheck.dailyCost,
          dailyLimit: costCheck.dailyLimit,
          currentRate: 0,
          rateLimit: 0,
          isSpike: false,
          spikeMultiplier: 0
        }
      };
    }

    // Verificar rate limiting
    const rateCheck = await this.checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return {
        allowed: false,
        reason: rateCheck.reason,
        metrics: {
          dailyCost: costCheck.dailyCost,
          dailyLimit: costCheck.dailyLimit,
          currentRate: rateCheck.currentRate,
          rateLimit: rateCheck.limit,
          isSpike: false,
          spikeMultiplier: 0
        }
      };
    }

    // Detectar picos inusuales
    const spikeCheck = await this.detectUnusualSpike(userId);

    return {
      allowed: true,
      metrics: {
        dailyCost: costCheck.dailyCost,
        dailyLimit: costCheck.dailyLimit,
        currentRate: rateCheck.currentRate,
        rateLimit: rateCheck.limit,
        isSpike: spikeCheck.isSpike,
        spikeMultiplier: spikeCheck.multiplier
      }
    };
  }
}