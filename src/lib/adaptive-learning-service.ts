import { supabase } from './supabase';

export interface ModelScore {
    modelName: string;
    provider: string;
    score: number;
    confidence: number;
    reasoning: string[];
}

export interface TaskContext {
    type: 'coding' | 'writing' | 'analysis' | 'conversation' | 'translation' | 'creative' | 'technical';
    complexity: 'simple' | 'medium' | 'complex';
    messageLength: number;
    keywords: string[];
    timeOfDay: number; // 0-23
}

export interface UserPreferences {
    userId: string;
    modelName: string;
    provider: string;
    usageCount: number;
    manualSelectionsCount: number;
    averageRating: number;
    successRate: number;
    taskTypes: Record<string, number>;
    lastUsedAt: string;
}

export class AdaptiveLearningService {

    /**
     * Analiza el contexto de una tarea basándose en el mensaje del usuario
     */
    static analyzeTaskContext(message: string): TaskContext {
        const messageLength = message.length;
        const lowerMessage = message.toLowerCase();

        // Detección del tipo de tarea
        let type: TaskContext['type'] = 'conversation';

        // Palabras clave para diferentes tipos de tareas
        const codeKeywords = ['function', 'class', 'variable', 'algorithm', 'debug', 'code', 'programming', 'syntax', 'api', 'database', 'sql', 'javascript', 'python', 'react', 'typescript'];
        const writingKeywords = ['write', 'essay', 'article', 'blog', 'content', 'story', 'email', 'letter', 'report', 'documentation'];
        const analysisKeywords = ['analyze', 'compare', 'evaluate', 'research', 'data', 'statistics', 'trends', 'insights', 'review'];
        const creativeKeywords = ['creative', 'brainstorm', 'ideas', 'design', 'artistic', 'innovative', 'imagine'];
        const translationKeywords = ['translate', 'translation', 'language', 'spanish', 'english', 'french', 'german'];
        const technicalKeywords = ['technical', 'specification', 'architecture', 'system', 'infrastructure', 'configuration'];

        const keywords: string[] = [];

        // Contar coincidencias para cada categoría
        const codeMatches = codeKeywords.filter(keyword => lowerMessage.includes(keyword));
        const writingMatches = writingKeywords.filter(keyword => lowerMessage.includes(keyword));
        const analysisMatches = analysisKeywords.filter(keyword => lowerMessage.includes(keyword));
        const creativeMatches = creativeKeywords.filter(keyword => lowerMessage.includes(keyword));
        const translationMatches = translationKeywords.filter(keyword => lowerMessage.includes(keyword));
        const technicalMatches = technicalKeywords.filter(keyword => lowerMessage.includes(keyword));

        keywords.push(...codeMatches, ...writingMatches, ...analysisMatches, ...creativeMatches, ...translationMatches, ...technicalMatches);

        // Determinar tipo basándose en mayor número de coincidencias
        const scores = {
            coding: codeMatches.length,
            writing: writingMatches.length,
            analysis: analysisMatches.length,
            creative: creativeMatches.length,
            translation: translationMatches.length,
            technical: technicalMatches.length
        };

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore > 0) {
            type = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as TaskContext['type'];
        }

        // Determinar complejidad
        let complexity: TaskContext['complexity'] = 'simple';
        if (messageLength > 500 || keywords.length > 3) {
            complexity = 'complex';
        } else if (messageLength > 150 || keywords.length > 1) {
            complexity = 'medium';
        }

        return {
            type,
            complexity,
            messageLength,
            keywords,
            timeOfDay: new Date().getHours()
        };
    }

    /**
     * Obtiene las preferencias del usuario para todos los modelos
     */
    static async getUserPreferences(userId: string): Promise<UserPreferences[]> {
        try {
            const { data, error } = await supabase
                .from('user_model_preferences')
                .select('*')
                .eq('user_id', userId)
                .order('usage_count', { ascending: false });

            if (error) {
                console.error('Error fetching user preferences:', error);
                return [];
            }

            return data.map(pref => ({
                userId: pref.user_id,
                modelName: pref.model_name,
                provider: pref.provider,
                usageCount: pref.usage_count,
                manualSelectionsCount: pref.manual_selections_count,
                averageRating: pref.user_rating_count > 0 ? pref.user_rating_sum / pref.user_rating_count : 0,
                successRate: pref.success_rate,
                taskTypes: pref.task_types || {},
                lastUsedAt: pref.last_used_at
            }));
        } catch (error) {
            console.error('Error in getUserPreferences:', error);
            return [];
        }
    }

    /**
     * Actualiza las preferencias del usuario después de usar un modelo
     */
    static async updateModelUsage(
        userId: string,
        modelName: string,
        provider: string,
        context: TaskContext,
        tokensUsed: number,
        cost: number,
        responseTime: number,
        wasManualSelection: boolean = false,
        success: boolean = true
    ): Promise<void> {
        try {
            // Preparar datos de contexto
            const messageLengthBucket = this.getMessageLengthBucket(context.messageLength);

            const { error } = await supabase.rpc('upsert_model_usage', {
                p_user_id: userId,
                p_model_name: modelName,
                p_provider: provider,
                p_tokens_used: tokensUsed,
                p_cost: cost,
                p_response_time: responseTime,
                p_was_manual_selection: wasManualSelection,
                p_success: success,
                p_task_type: context.type,
                p_time_of_day: context.timeOfDay,
                p_message_length_bucket: messageLengthBucket
            });

            if (error) {
                console.error('Error updating model usage:', error);
            }
        } catch (error) {
            console.error('Error in updateModelUsage:', error);
        }
    }

    /**
     * Calcula scores personalizados para todos los modelos disponibles
     */
    static async calculatePersonalizedScores(
        userId: string,
        availableModels: Array<{ name: string, provider: string }>,
        context: TaskContext
    ): Promise<ModelScore[]> {
        try {
            const userPreferences = await this.getUserPreferences(userId);
            const scores: ModelScore[] = [];

            for (const model of availableModels) {
                const score = await this.calculateModelScore(userId, model.name, userPreferences, context);
                scores.push(score);
            }

            // Ordenar por score descendente
            return scores.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Error calculating personalized scores:', error);
            // Retornar scores base si hay error
            return availableModels.map(model => ({
                modelName: model.name,
                provider: model.provider,
                score: 0.5,
                confidence: 0.1,
                reasoning: ['No personalization data available']
            }));
        }
    }

    /**
     * Calcula el score para un modelo específico
     */
    private static async calculateModelScore(
        userId: string,
        modelName: string,
        userPreferences: UserPreferences[],
        context: TaskContext
    ): Promise<ModelScore> {
        const reasoning: string[] = [];
        let score = 0.5; // Score base
        let confidence = 0.1;

        // Buscar preferencias del usuario para este modelo
        const modelPref = userPreferences.find(pref => pref.modelName === modelName);

        if (modelPref) {
            confidence = Math.min(0.9, modelPref.usageCount / 50); // Más uso = mayor confianza

            // Factor de rating del usuario (40% del score)
            if (modelPref.averageRating > 0) {
                const ratingScore = modelPref.averageRating / 5;
                score += ratingScore * 0.4;
                reasoning.push(`User rating: ${modelPref.averageRating.toFixed(1)}/5`);
            }

            // Factor de selección manual (20% del score)
            if (modelPref.manualSelectionsCount > 0) {
                const manualScore = Math.min(modelPref.manualSelectionsCount / 20, 1) * 0.2;
                score += manualScore;
                reasoning.push(`Manual selections: ${modelPref.manualSelectionsCount}`);
            }

            // Factor de éxito (20% del score)
            const successScore = modelPref.successRate * 0.2;
            score += successScore;
            reasoning.push(`Success rate: ${(modelPref.successRate * 100).toFixed(1)}%`);

            // Factor de contexto de tarea (20% del score)
            const taskTypeUsage = modelPref.taskTypes[context.type] || 0;
            if (taskTypeUsage > 0) {
                const contextScore = Math.min(taskTypeUsage / 10, 1) * 0.2;
                score += contextScore;
                reasoning.push(`Used ${taskTypeUsage} times for ${context.type} tasks`);
            }

            reasoning.push(`Total usage: ${modelPref.usageCount} times`);
        } else {
            reasoning.push('No usage history');
        }

        // Aplicar multiplicadores basados en el contexto
        score = this.applyContextMultipliers(score, modelName, context, reasoning);

        // Asegurar que el score esté en rango válido
        score = Math.max(0, Math.min(1, score));

        return {
            modelName,
            provider: modelName.includes('gpt') ? 'openai' :
                modelName.includes('claude') ? 'anthropic' :
                    modelName.includes('gemini') ? 'google' : 'unknown',
            score,
            confidence,
            reasoning
        };
    }

    /**
     * Aplica multiplicadores basados en el contexto de la tarea
     */
    private static applyContextMultipliers(
        baseScore: number,
        modelName: string,
        context: TaskContext,
        reasoning: string[]
    ): number {
        let multiplier = 1.0;

        // Multiplicadores por tipo de tarea
        switch (context.type) {
            case 'coding':
                if (modelName.includes('gpt-4') || modelName.includes('claude-3.5-sonnet')) {
                    multiplier *= 1.2;
                    reasoning.push('Coding task bonus');
                }
                break;
            case 'creative':
                if (modelName.includes('gpt-4') || modelName.includes('claude-3-opus')) {
                    multiplier *= 1.15;
                    reasoning.push('Creative task bonus');
                }
                break;
            case 'analysis':
                if (modelName.includes('claude') || modelName.includes('gpt-4')) {
                    multiplier *= 1.1;
                    reasoning.push('Analysis task bonus');
                }
                break;
            case 'conversation':
                if (modelName.includes('gpt-3.5') || modelName.includes('gemini')) {
                    multiplier *= 1.05;
                    reasoning.push('Conversation task bonus');
                }
                break;
        }

        // Multiplicadores por complejidad
        switch (context.complexity) {
            case 'complex':
                if (modelName.includes('gpt-4') || modelName.includes('opus') || modelName.includes('sonnet')) {
                    multiplier *= 1.1;
                    reasoning.push('Complex task bonus');
                }
                break;
            case 'simple':
                if (modelName.includes('gpt-3.5') || modelName.includes('haiku') || modelName.includes('flash')) {
                    multiplier *= 1.05;
                    reasoning.push('Simple task bonus');
                }
                break;
        }

        return baseScore * multiplier;
    }

    /**
     * Registra feedback del usuario sobre una respuesta
     */
    static async recordUserFeedback(
        userId: string,
        usageRecordId: string,
        modelName: string,
        provider: string,
        rating: number,
        feedbackText?: string,
        categories?: Record<string, boolean>,
        context?: TaskContext
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_model_feedback')
                .insert({
                    user_id: userId,
                    usage_record_id: usageRecordId,
                    model_name: modelName,
                    provider: provider,
                    rating: rating,
                    feedback_text: feedbackText,
                    feedback_categories: categories,
                    task_type: context?.type,
                    message_length: context?.messageLength,
                    complexity_level: context?.complexity
                });

            if (error) {
                console.error('Error recording user feedback:', error);
                return;
            }

            // Actualizar las preferencias del modelo con el nuevo rating
            await this.updateModelRating(userId, modelName, rating);
        } catch (error) {
            console.error('Error in recordUserFeedback:', error);
        }
    }

    /**
     * Actualiza el rating promedio de un modelo para el usuario
     */
    private static async updateModelRating(userId: string, modelName: string, rating: number): Promise<void> {
        try {
            const { error } = await supabase.rpc('update_model_rating', {
                p_user_id: userId,
                p_model_name: modelName,
                p_rating: rating
            });

            if (error) {
                console.error('Error updating model rating:', error);
            }
        } catch (error) {
            console.error('Error in updateModelRating:', error);
        }
    }

    /**
     * Obtiene el bucket de longitud de mensaje para categorización
     */
    private static getMessageLengthBucket(length: number): string {
        if (length < 100) return 'short';
        if (length < 500) return 'medium';
        if (length < 1500) return 'long';
        return 'very_long';
    }

    /**
     * Obtiene recomendaciones de modelos basadas en el aprendizaje
     */
    static async getModelRecommendations(
        userId: string,
        context: TaskContext,
        availableModels: Array<{ name: string, provider: string }>,
        limit: number = 3
    ): Promise<ModelScore[]> {
        const scores = await this.calculatePersonalizedScores(userId, availableModels, context);
        return scores.slice(0, limit);
    }
}