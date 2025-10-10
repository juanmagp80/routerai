import { supabase } from './supabase';

export interface DashboardStats {
  api_calls: number;
  active_users: number;
  models_available: number;
  avg_response_time: number;
  usage_trend: number;
  active_models: number;
  total_cost: number;
  success_rate: number;
}

export interface UserStats {
  total_api_calls: number;
  active_api_keys: number;
  total_cost: number;
  last_api_call: string | null;
  success_rate: number;
  favorite_model: string | null;
}

export class StatsService {
  // Obtener estadísticas del dashboard para admin
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Obtener número total de llamadas API del último mes
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: usageRecords } = await supabase
        .from('usage_records')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Obtener número de usuarios activos
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true);

      // Obtener claves API activas (para información general)
      const { data: activeKeys } = await supabase
        .from('api_keys')
        .select('id')
        .eq('is_active', true);

      console.log(`Active API keys: ${activeKeys?.length || 0}`);

      // Calcular estadísticas
      const totalCalls = usageRecords?.length || 0;
      const activeUserCount = activeUsers?.length || 0;

      // Calcular tiempo promedio de respuesta (simulado basado en tokens)
      const avgResponseTime = usageRecords?.length 
        ? usageRecords.reduce((sum, usage) => sum + (usage.output_tokens / 1000), 0) / usageRecords.length
        : 0;

      // Simular tasa de éxito (99% por defecto para datos reales)
      const successRate = totalCalls > 0 ? 99 : 0;

      // Calcular costo total
      const totalCost = usageRecords?.reduce((sum, usage) => sum + (usage.cost || 0), 0) || 0;

      // Calcular tendencia (comparar con mes anterior)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: previousMonthUsage } = await supabase
        .from('usage_records')
        .select('*')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const previousMonthCalls = previousMonthUsage?.length || 0;
      const usageTrend = previousMonthCalls > 0 
        ? ((totalCalls - previousMonthCalls) / previousMonthCalls) * 100
        : totalCalls > 0 ? 100 : 0;

      // Contar modelos únicos utilizados
      const uniqueModels = new Set(usageRecords?.map(usage => usage.model_used).filter(Boolean));

      return {
        api_calls: totalCalls,
        active_users: activeUserCount,
        models_available: 8, // Número fijo de modelos disponibles
        avg_response_time: Math.round(avgResponseTime * 100) / 100,
        usage_trend: Math.round(usageTrend * 100) / 100,
        active_models: uniqueModels.size,
        total_cost: Math.round(totalCost * 100) / 100,
        success_rate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      // Retornar datos por defecto en caso de error
      return {
        api_calls: 0,
        active_users: 0,
        models_available: 8,
        avg_response_time: 0,
        usage_trend: 0,
        active_models: 0,
        total_cost: 0,
        success_rate: 0,
      };
    }
  }

  // Obtener estadísticas específicas del usuario
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Obtener uso de API del usuario
      const { data: userUsageRecords } = await supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Obtener claves API activas del usuario
      const { data: userApiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      const totalApiCalls = userUsageRecords?.length || 0;
      const activeApiKeys = userApiKeys?.length || 0;

      // Calcular costo total del usuario
      const totalCost = userUsageRecords?.reduce((sum, usage) => sum + (usage.cost || 0), 0) || 0;

      // Obtener última llamada API
      const lastApiCall = userUsageRecords?.[0]?.created_at || null;

      // Simular tasa de éxito (99% para datos reales)
      const successRate = totalApiCalls > 0 ? 99 : 0;

      // Encontrar modelo favorito
      const modelCounts: { [key: string]: number } = {};
      userUsageRecords?.forEach(usage => {
        if (usage.model_used) {
          modelCounts[usage.model_used] = (modelCounts[usage.model_used] || 0) + 1;
        }
      });

      const favoriteModel = Object.keys(modelCounts).length > 0
        ? Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b)
        : null;

      return {
        total_api_calls: totalApiCalls,
        active_api_keys: activeApiKeys,
        total_cost: Math.round(totalCost * 100) / 100,
        last_api_call: lastApiCall,
        success_rate: Math.round(successRate * 100) / 100,
        favorite_model: favoriteModel,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      return {
        total_api_calls: 0,
        active_api_keys: 0,
        total_cost: 0,
        last_api_call: null,
        success_rate: 0,
        favorite_model: null,
      };
    }
  }

  // Obtener actividad reciente del usuario
  static async getRecentActivity(userId: string, limit: number = 10) {
    try {
      const { data: recentActivity } = await supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return recentActivity || [];
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return [];
    }
  }

  // Obtener uso por modelo del usuario
  static async getModelUsage(userId: string) {
    try {
      const { data: modelUsage } = await supabase
        .from('usage_records')
        .select('model_used, cost, created_at')
        .eq('user_id', userId)
        .not('model_used', 'is', null);

      // Agrupar por modelo
      const groupedUsage: { [key: string]: { count: number, cost: number } } = {};
      
      modelUsage?.forEach(usage => {
        const model = usage.model_used!;
        if (!groupedUsage[model]) {
          groupedUsage[model] = { count: 0, cost: 0 };
        }
        groupedUsage[model].count++;
        groupedUsage[model].cost += usage.cost || 0;
      });

      return Object.entries(groupedUsage).map(([model, stats]) => ({
        model,
        count: stats.count,
        cost: Math.round(stats.cost * 100) / 100,
      }));
    } catch (error) {
      console.error('Error obteniendo uso por modelo:', error);
      return [];
    }
  }
}