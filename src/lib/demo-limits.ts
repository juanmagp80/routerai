// Demo mode settings - informative only since provider limits are configured
export const DEMO_LIMITS = {
    // Informative limits (not enforced, just for display)
    SUGGESTED_REQUESTS_PER_DAY: 20,

    // Warning thresholds
    WARNING_MESSAGE_LENGTH: 1000,

    // Preferred models for cost efficiency (suggestions only)
    COST_EFFICIENT_MODELS: [
        'gpt-3.5-turbo',
        'claude-3-haiku-20240307',
        'gemini-1.5-flash',
        'llama-3.1-8b-instant'
    ],

    // All models available (since provider limits handle costs)
    ALL_AVAILABLE_MODELS: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4-turbo',
        'claude-3-haiku-20240307',
        'claude-3-sonnet-20240229',
        'claude-3-opus-20240229',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'grok-beta'
    ],

    // Time windows
    DEMO_RESET_HOUR: 0, // UTC hour when stats reset
} as const;

// Demo warning messages
export const DEMO_MESSAGES = {
    COST_EFFICIENT_SUGGESTION: "💡 Para reducir costos, considera usar modelos más económicos como gpt-3.5-turbo o claude-3-haiku",
    LONG_MESSAGE_WARNING: "⚠️ Mensaje largo detectado - esto puede incrementar los costos de la API",
    DEMO_NOTICE: "🧪 Modo Demo: Proyecto de portfolio con límites configurados en proveedores",
    PROVIDER_LIMITS_INFO: "Los límites de gasto están configurados directamente en cada proveedor de AI para máxima seguridad"
} as const;

export type DemoLimitType = keyof typeof DEMO_LIMITS;