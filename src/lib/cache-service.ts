export interface CacheConfig {
  similarQueries: number;     // Cache para queries similares
  modelResponses: number;     // Cache para respuestas de modelo  
  userSettings: number;       // Cache para configuraciones de usuario
  planLimits: number;        // Cache para límites de plan
  apiKeyValidation: number;  // Cache para validación de API keys
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
}

export const CACHE_CONFIG: CacheConfig = {
  similarQueries: 300,      // 5 min - Queries similares de usuarios
  modelResponses: 1800,     // 30 min - Respuestas de IA para prompts comunes
  userSettings: 3600,       // 1 hora - Configuraciones de usuario
  planLimits: 7200,         // 2 horas - Límites de planes (cambian poco)
  apiKeyValidation: 1800    // 30 min - Validación de API keys
};

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };

  static getInstance(): CacheService {
    if (!this.instance) {
      this.instance = new CacheService();
    }
    return this.instance;
  }

  // Generar clave de cache
  private generateKey(namespace: string, key: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${namespace}:${key}:${this.hashString(paramsStr)}`;
  }

  // Hash simple para parámetros
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Obtener del cache
  get<T>(namespace: keyof CacheConfig, key: string, params?: any): T | null {
    const cacheKey = this.generateKey(namespace, key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      return null;
    }

    // Incrementar hits
    entry.hits++;
    this.stats.hits++;
    
    return entry.data;
  }

  // Guardar en cache
  set<T>(namespace: keyof CacheConfig, key: string, value: T, params?: any): void {
    const cacheKey = this.generateKey(namespace, key, params);
    const ttl = CACHE_CONFIG[namespace] * 1000; // Convertir a ms
    
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      hits: 0
    };

    this.cache.set(cacheKey, entry);
    
    // Limpiar entradas expiradas periódicamente
    if (this.cache.size % 100 === 0) {
      this.cleanExpired();
    }
  }

  // Invalidar cache por namespace
  invalidate(namespace: keyof CacheConfig, key?: string): void {
    if (key) {
      // Invalidar clave específica
      const pattern = `${namespace}:${key}:`;
      const keysToDelete: string[] = [];
      this.cache.forEach((_, cacheKey) => {
        if (cacheKey.startsWith(pattern)) {
          keysToDelete.push(cacheKey);
        }
      });
      keysToDelete.forEach(k => this.cache.delete(k));
    } else {
      // Invalidar todo el namespace
      const pattern = `${namespace}:`;
      const keysToDelete: string[] = [];
      this.cache.forEach((_, cacheKey) => {
        if (cacheKey.startsWith(pattern)) {
          keysToDelete.push(cacheKey);
        }
      });
      keysToDelete.forEach(k => this.cache.delete(k));
    }
  }

  // Limpiar entradas expiradas
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(k => this.cache.delete(k));
  }

  // Obtener estadísticas del cache
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Calcular uso aproximado de memoria
    const entries: Array<[string, CacheEntry<any>]> = [];
    this.cache.forEach((entry, key) => {
      entries.push([key, entry]);
    });
    const memoryUsage = JSON.stringify(entries).length;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      totalEntries: this.cache.size,
      memoryUsage
    };
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  // Método helper para cache con callback
  async getOrSet<T>(
    namespace: keyof CacheConfig, 
    key: string, 
    fetcher: () => Promise<T>,
    params?: any
  ): Promise<T> {
    // Intentar obtener del cache
    const cached = this.get<T>(namespace, key, params);
    if (cached !== null) {
      return cached;
    }

    // Si no está en cache, ejecutar fetcher
    const value = await fetcher();
    
    // Guardar en cache
    this.set(namespace, key, value, params);
    
    return value;
  }
}

// Funciones helper específicas para casos de uso comunes
export class CacheHelpers {
  private static cache = CacheService.getInstance();

  // Cache para respuestas de IA similares
  static async getCachedAIResponse(
    prompt: string, 
    model: string,
    temperature: number,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const params = { model, temperature: Math.round(temperature * 10) / 10 };
    return this.cache.getOrSet('modelResponses', prompt, fetcher, params);
  }

  // Cache para validación de API keys
  static async getCachedApiKeyValidation(
    apiKey: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    return this.cache.getOrSet('apiKeyValidation', apiKey, fetcher);
  }

  // Cache para límites de planes
  static async getCachedPlanLimits(
    planName: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    return this.cache.getOrSet('planLimits', planName, fetcher);
  }

  // Cache para configuraciones de usuario
  static async getCachedUserSettings(
    userId: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    return this.cache.getOrSet('userSettings', userId, fetcher);
  }

  // Invalidar cache de usuario cuando cambia algo
  static invalidateUserCache(userId: string): void {
    this.cache.invalidate('userSettings', userId);
    this.cache.invalidate('apiKeyValidation'); // Invalidar todas las API keys por seguridad
  }

  // Invalidar cache de plan cuando se actualiza
  static invalidatePlanCache(planName?: string): void {
    if (planName) {
      this.cache.invalidate('planLimits', planName);
    } else {
      this.cache.invalidate('planLimits');
    }
  }

  // Obtener estadísticas del cache
  static getStats(): CacheStats {
    return this.cache.getStats();
  }
}

// Middleware de cache para respuestas de IA
export class AICacheMiddleware {
  private static cache = CacheService.getInstance();

  // Verificar si una respuesta debe ser cacheada
  static shouldCache(prompt: string, model: string, temperature: number): boolean {
    // No cachear si temperature es muy alta (respuestas más creativas)
    if (temperature > 0.8) return false;

    // No cachear prompts muy cortos o muy largos
    if (prompt.length < 10 || prompt.length > 2000) return false;

    // No cachear prompts que parecen únicos (contienen timestamps, IDs, etc.)
    const uniquePatterns = [
      /\d{4}-\d{2}-\d{2}/, // Fechas
      /\d{10,}/, // IDs largos
      /user_\w+/, // User IDs
      /\b\d{1,2}:\d{2}/, // Horarios
    ];

    return !uniquePatterns.some(pattern => pattern.test(prompt));
  }

  // Procesar request con cache
  static async processWithCache<T>(
    prompt: string,
    model: string,
    temperature: number,
    fetcher: () => Promise<T>
  ): Promise<{ data: T; fromCache: boolean }> {
    // Verificar si debe ser cacheado
    if (!this.shouldCache(prompt, model, temperature)) {
      const data = await fetcher();
      return { data, fromCache: false };
    }

    // Intentar obtener del cache
    const params = { model, temperature: Math.round(temperature * 10) / 10 };
    const cached = this.cache.get<T>('modelResponses', prompt, params);
    
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    // Ejecutar fetcher y guardar en cache
    const data = await fetcher();
    this.cache.set('modelResponses', prompt, data, params);
    
    return { data, fromCache: false };
  }

  // Limpiar cache de respuestas de IA
  static clearAICache(): void {
    this.cache.invalidate('modelResponses');
  }
}

// Exportar instancia global
export const globalCache = CacheService.getInstance();