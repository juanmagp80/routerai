import { createClient } from '@supabase/supabase-js';
import { DEMO_LIMITS, DEMO_MESSAGES } from './demo-limits';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DemoInfo {
    suggestions?: string[];
    warnings?: string[];
    stats?: any;
}

export class DemoLimitManager {
    private static isProduction = process.env.NODE_ENV === 'production';

    // Check if we're in demo mode (production environment)
    static isDemoMode(): boolean {
        return this.isProduction;
    }

    // Get today's date string for usage tracking
    private static getTodayKey(): string {
        return new Date().toISOString().split('T')[0];
    }

    // Get suggestions for cost optimization (non-blocking)
    static getCostOptimizationSuggestions(model: string, messageLength: number): string[] {
        const suggestions: string[] = [];

        if (!this.isDemoMode()) {
            return suggestions;
        }

        // Suggest cost-efficient models
        if (!DEMO_LIMITS.COST_EFFICIENT_MODELS.includes(model as any)) {
            suggestions.push(DEMO_MESSAGES.COST_EFFICIENT_SUGGESTION);
        }

        // Warn about long messages
        if (messageLength > DEMO_LIMITS.WARNING_MESSAGE_LENGTH) {
            suggestions.push(DEMO_MESSAGES.LONG_MESSAGE_WARNING);
        }

        return suggestions;
    }

    // Check if all models are available (now they all are since provider limits protect costs)
    static isModelAllowed(model: string): boolean {
        return DEMO_LIMITS.ALL_AVAILABLE_MODELS.includes(model as any) || model === 'auto';
    }

    // Get demo information for UI display
    static getDemoInfo(): DemoInfo {
        if (!this.isDemoMode()) {
            return {};
        }

        return {
            suggestions: [
                DEMO_MESSAGES.DEMO_NOTICE,
                DEMO_MESSAGES.PROVIDER_LIMITS_INFO
            ]
        };
    }

    // Get usage statistics for user (informative only)
    static async getUserUsageStats(userId: string) {
        if (!this.isDemoMode()) {
            return null;
        }

        const today = this.getTodayKey();

        try {
            const { data: userRequests, error } = await supabase
                .from('usage_records')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', `${today}T00:00:00Z`)
                .lt('created_at', `${today}T23:59:59Z`);

            if (error) {
                console.error('Error getting usage stats:', error);
                return null;
            }

            const requestCount = userRequests?.length || 0;
            const totalCost = userRequests?.reduce((sum, req) => sum + (req.cost || 0), 0) || 0;

            return {
                requestsToday: requestCount,
                totalCostToday: totalCost,
                resetTime: `${today}T${DEMO_LIMITS.DEMO_RESET_HOUR.toString().padStart(2, '0')}:00:00Z`,
                suggestedDailyLimit: DEMO_LIMITS.SUGGESTED_REQUESTS_PER_DAY
            };

        } catch (error) {
            console.error('Error in getUserUsageStats:', error);
            return null;
        }
    }
}