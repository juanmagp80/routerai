// SISTEMA DE PROTECCIÓN DE COSTOS
// Implementar ANTES de producción

const COST_PROTECTION_CONFIG = {
  // Límites diarios por usuario (independiente del plan)
  DAILY_COST_LIMIT: {
    free: 0.02,     // $0.02/día máximo
    starter: 2.00,   // $2.00/día máximo  
    pro: 8.00,       // $8.00/día máximo
    enterprise: 32.00 // $32.00/día máximo
  },
  
  // Rate limiting estricto (requests por minuto)
  RATE_LIMITS: {
    free: 2,        // 2 req/min
    starter: 10,    // 10 req/min
    pro: 25,        // 25 req/min
    enterprise: 50  // 50 req/min
  },
  
  // Alertas automáticas
  COST_ALERTS: {
    DAILY_80_PERCENT: true,  // Alerta al 80% del límite diario
    MONTHLY_50_PERCENT: true, // Alerta al 50% del límite mensual
    UNUSUAL_SPIKE: true       // Alerta por picos inusuales
  }
};

// IMPLEMENTACIONES NECESARIAS:

// 1. Middleware de protección de costos
export async function costProtectionMiddleware(userId, userPlan) {
  const todayCost = await getTodayCostForUser(userId);
  const dailyLimit = COST_PROTECTION_CONFIG.DAILY_COST_LIMIT[userPlan];
  
  if (todayCost >= dailyLimit) {
    throw new Error(`Límite de costo diario alcanzado: $${dailyLimit}`);
  }
  
  return true;
}

// 2. Sistema de caching para reducir costos
export const CACHE_CONFIG = {
  SIMILAR_QUERIES: 300,    // 5 min cache para queries similares
  MODEL_RESPONSES: 1800,   // 30 min cache para respuestas de modelo
  USER_SETTINGS: 3600      // 1 hora cache para configuraciones
};

// 3. Monitoreo en tiempo real
export async function setupCostMonitoring() {
  // Webhook para alertas de Supabase
  // Dashboard de costos en tiempo real
  // Notificaciones automáticas por email/SMS
}

module.exports = {
  COST_PROTECTION_CONFIG,
  costProtectionMiddleware,
  CACHE_CONFIG,
  setupCostMonitoring
};